'use server';

import { createServerClient } from './supabase';

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
 * ファイルを Storage (PHOTOS) にアップロードし、公開 URL を photos に保存する。
 * 未ログイン時は Vercel の SWEY_ANONYMOUS_OWNER_ID（profiles.id の UUID）を設定すること。
 */
export async function uploadPhoto(formData: FormData) {
  const file = formData.get('file') as File | null;
  if (!file?.size) {
    return { ok: false, error: 'ファイルを選択してください' };
  }

  const ownerId = process.env.SWEY_ANONYMOUS_OWNER_ID;
  if (!ownerId) {
    return { ok: false, error: '投稿用オーナーが未設定です（SWEY_ANONYMOUS_OWNER_ID）' };
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
    access_type: 'free',
  });

  if (insertError) {
    return { ok: false, error: insertError.message || '写真の登録に失敗しました' };
  }
  return { ok: true, url: imageUrl };
}
