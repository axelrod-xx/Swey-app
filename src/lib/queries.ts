import { getSupabase } from './supabase';
import type { Photo, Profile } from './types';

const MIN_PHOTOS_FOR_SIMILAR_ELO = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * バトル用: レートが近い2枚をランダム取得。viewerId 未指定時は free のみ。
 */
export async function getRandomPhotos(viewerId: string | null = null): Promise<Photo[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  let query = supabase
    .from('photos')
    .select('id, owner_id, image_url, elo_rating, access_type, tags, is_nsfw')
    .eq('status', 'active')
    .limit(500);

  if (!viewerId) {
    query = query.eq('access_type', 'free');
  }

  const { data: photos, error } = await query;

  if (error || !photos || photos.length < 2) return null;
  const typed = photos as Photo[];

  if (typed.length < MIN_PHOTOS_FOR_SIMILAR_ELO) {
    return shuffle(typed).slice(0, 2);
  }
  const sorted = [...typed].sort((a, b) => a.elo_rating - b.elo_rating);
  const pairIndex = Math.floor(Math.random() * (sorted.length - 1));
  return shuffle([sorted[pairIndex], sorted[pairIndex + 1]]);
}

/**
 * 総合ランキング。tagCategory (part/title/character) で絞り込み可能（そのキーが存在するもののみ）。
 */
export async function getTopRanking(tagCategory?: string): Promise<Photo[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('photos')
    .select('id, owner_id, image_url, elo_rating, access_type, tags, is_nsfw')
    .eq('status', 'active')
    .eq('access_type', 'free')
    .order('elo_rating', { ascending: false })
    .limit(100);

  if (error) return null;
  let list = (data || []) as Photo[];
  if (tagCategory) {
    list = list.filter((p) => p.tags && p.tags[tagCategory] != null);
  }
  return list.slice(0, 10);
}

/**
 * タイムライン: フォロー中のユーザーの投稿を時系列。viewerId 未指定時は空。
 */
export async function getTimelinePhotos(viewerId: string | null): Promise<Photo[] | null> {
  const supabase = getSupabase();
  if (!supabase || !viewerId) return null;

  const { data: followings } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', viewerId);
  const ids = (followings || []).map((r) => r.following_id);
  if (ids.length === 0) return null;

  const { data, error } = await supabase
    .from('photos')
    .select('id, owner_id, image_url, elo_rating, access_type, tags, is_nsfw, created_at')
    .in('owner_id', ids)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return null;
  return (data || null) as Photo[] | null;
}

/**
 * 注目のバトル（直近の対戦からランダムに数件）
 */
export async function getFeaturedBattles(limit = 5) {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from('battles')
    .select('winner_id, loser_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit * 3);
  if (!data || data.length === 0) return [];
  const shuffled = shuffle([...data]);
  return shuffled.slice(0, limit);
}

/**
 * プロフィール取得
 */
export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, elo_rating')
    .eq('id', id)
    .single();
  return data as Profile | null;
}

/**
 * ユーザーの投稿一覧
 */
export async function getPhotosByOwner(ownerId: string): Promise<Photo[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from('photos')
    .select('id, owner_id, image_url, elo_rating, access_type, tags, is_nsfw')
    .eq('owner_id', ownerId)
    .eq('status', 'active')
    .order('elo_rating', { ascending: false });
  return (data || null) as Photo[] | null;
}

/**
 * フォロワー数
 */
export async function getFollowerCount(profileId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;
  const { count } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profileId);
  return count ?? 0;
}

/**
 * DM 用プロファイル一覧（メッセージのやり取りがあるユーザー）
 */
export async function getMessagePartners(userId: string): Promise<Profile[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data: sent } = await supabase.from('messages').select('receiver_id').eq('sender_id', userId);
  const { data: received } = await supabase.from('messages').select('sender_id').eq('receiver_id', userId);
  const ids = new Set<string>();
  (sent || []).forEach((r) => ids.add(r.receiver_id));
  (received || []).forEach((r) => ids.add(r.sender_id));
  ids.delete(userId);
  if (ids.size === 0) return [];
  const { data } = await supabase.from('profiles').select('id, display_name, avatar_url, elo_rating').in('id', [...ids]);
  return (data || []) as Profile[];
}

/**
 * 2ユーザー間のメッセージ取得
 */
export async function getMessages(userId: string, partnerId: string) {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id, content, is_read, created_at')
    .in('sender_id', [userId, partnerId])
    .in('receiver_id', [userId, partnerId])
    .order('created_at', { ascending: true });
  return data || [];
}
