'use server';

import { createServerClient } from './supabase';
import type { AccessType, PhotoTags } from './types';

const K = 32;

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function newRating(current: number, expected: number, actual: number): number {
  return Math.round(current + K * (actual - expected));
}

/**
 * 勝敗を受け取り Elo（K=32）で両者の elo_rating を更新し、battles に記録する。
 */
export async function votePhoto(
  winnerPhotoId: string,
  loserPhotoId: string,
  voterId: string | null = null
) {
  const supabase = createServerClient();

  const { data: photos, error: fetchError } = await supabase
    .from('photos')
    .select('id, elo_rating')
    .in('id', [winnerPhotoId, loserPhotoId]);

  if (fetchError || !photos || photos.length !== 2) {
    return { ok: false, error: '写真の取得に失敗しました' };
  }

  const winner = photos.find((p) => p.id === winnerPhotoId);
  const loser = photos.find((p) => p.id === loserPhotoId);
  if (!winner || !loser) {
    return { ok: false, error: '対象の写真が見つかりません' };
  }

  const Rw = winner.elo_rating;
  const Rl = loser.elo_rating;
  const newWinnerRating = newRating(Rw, expectedScore(Rw, Rl), 1);
  const newLoserRating = newRating(Rl, expectedScore(Rl, Rw), 0);

  const [uw, ul] = await Promise.all([
    supabase.from('photos').update({ elo_rating: newWinnerRating }).eq('id', winnerPhotoId),
    supabase.from('photos').update({ elo_rating: newLoserRating }).eq('id', loserPhotoId),
  ]);
  if (uw.error || ul.error) {
    return { ok: false, error: 'レートの更新に失敗しました' };
  }

  const { error: insertError } = await supabase.from('battles').insert({
    winner_id: winnerPhotoId,
    loser_id: loserPhotoId,
    voter_id: voterId,
  });
  if (insertError) {
    return { ok: false, error: '対戦記録の保存に失敗しました' };
  }
  return { ok: true };
}

const BUCKET = 'PHOTOS';

/**
 * 画像アップロード。tags（部位・作品名・キャラ名）、access_type、is_nsfw を設定可能。
 */
export async function uploadPhoto(formData: FormData) {
  const file = formData.get('file') as File | null;
  if (!file?.size) {
    return { ok: false, error: 'ファイルを選択してください' };
  }

  const ownerId = (formData.get('userId') as string) || process.env.SWEY_ANONYMOUS_OWNER_ID;
  if (!ownerId) {
    return { ok: false, error: 'ログインするか、投稿用オーナーを設定してください' };
  }

  const accessType = (formData.get('access_type') as AccessType) || 'free';
  const isNsfw = formData.get('is_nsfw') === 'true';
  const tagsRaw = formData.get('tags');
  const tags: PhotoTags = {};
  if (typeof tagsRaw === 'string') {
    try {
      const parsed = JSON.parse(tagsRaw) as Record<string, string>;
      if (parsed.part) tags.part = parsed.part;
      if (parsed.title) tags.title = parsed.title;
      if (parsed.character) tags.character = parsed.character;
    } catch {
      // ignore
    }
  }

  const supabase = createServerClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    return { ok: false, error: uploadError.message || 'アップロードに失敗しました' };
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const imageUrl = urlData.publicUrl;

  const { error: insertError } = await supabase.from('photos').insert({
    owner_id: ownerId,
    image_url: imageUrl,
    elo_rating: 1500,
    status: 'active',
    access_type: accessType,
    is_nsfw: isNsfw,
    tags: Object.keys(tags).length ? tags : null,
  });

  if (insertError) {
    return { ok: false, error: insertError.message || '写真の登録に失敗しました' };
  }
  return { ok: true, url: imageUrl };
}

export async function followUser(followerId: string, followingId: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
  return { ok: !error, error: error?.message };
}

export async function unfollowUser(followerId: string, followingId: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
  return { ok: !error, error: error?.message };
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from('messages').insert({ sender_id: senderId, receiver_id: receiverId, content });
  return { ok: !error, error: error?.message };
}

export async function subscribeCreator(subscriberId: string, creatorId: string, expiresAt: Date) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      { subscriber_id: subscriberId, creator_id: creatorId, expires_at: expiresAt.toISOString() },
      { onConflict: 'subscriber_id,creator_id' }
    );
  return { ok: !error, error: error?.message };
}

/** 管理者かどうか確認 */
async function ensureAdmin(adminUserId: string): Promise<boolean> {
  const supabase = createServerClient();
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', adminUserId).single();
  return (data as { is_admin?: boolean } | null)?.is_admin === true;
}

export async function adminBanUser(adminUserId: string, targetUserId: string) {
  if (!(await ensureAdmin(adminUserId))) return { ok: false, error: '権限がありません' };
  const supabase = createServerClient();
  const { error } = await supabase.from('profiles').update({ is_banned: true }).eq('id', targetUserId);
  return { ok: !error, error: error?.message };
}

export async function adminUnbanUser(adminUserId: string, targetUserId: string) {
  if (!(await ensureAdmin(adminUserId))) return { ok: false, error: '権限がありません' };
  const supabase = createServerClient();
  const { error } = await supabase.from('profiles').update({ is_banned: false }).eq('id', targetUserId);
  return { ok: !error, error: error?.message };
}

export async function adminHidePhoto(adminUserId: string, photoId: string) {
  if (!(await ensureAdmin(adminUserId))) return { ok: false, error: '権限がありません' };
  const supabase = createServerClient();
  const { error } = await supabase.from('photos').update({ status: 'hidden' }).eq('id', photoId);
  return { ok: !error, error: error?.message };
}

export async function adminResolveReport(adminUserId: string, reportId: string, action: 'resolved' | 'dismissed') {
  if (!(await ensureAdmin(adminUserId))) return { ok: false, error: '権限がありません' };
  const supabase = createServerClient();
  const { error } = await supabase
    .from('reports')
    .update({ status: action, resolved_at: new Date().toISOString(), resolved_by: adminUserId })
    .eq('id', reportId);
  return { ok: !error, error: error?.message };
}

export async function reportPhoto(reporterId: string, photoId: string, reason: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from('reports').insert({ reporter_id: reporterId, photo_id: photoId, reason });
  return { ok: !error, error: error?.message };
}
