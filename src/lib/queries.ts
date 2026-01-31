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
 * スワイプ用: ランダムに1枚ずつ取得。viewerId 指定時は既に like/pass した写真を除外。
 * デッキ用に複数枚取得する場合は limit を指定。
 */
export async function getSwipePhotos(
  viewerId: string | null = null,
  limit = 20,
  excludePhotoIds: string[] = []
): Promise<Photo[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from('photos')
    .select('id, owner_id, image_url, elo_rating, access_type, tags, is_nsfw')
    .eq('status', 'active')
    .limit(limit * 3);

  if (!viewerId) {
    query = query.eq('access_type', 'free');
  }

  const { data: photos, error } = await query;
  if (error || !photos || photos.length === 0) return [];

  let typed = photos as Photo[];
  let excludedIds = new Set(excludePhotoIds);

  if (viewerId) {
    const { data: likesData } = await supabase
      .from('likes')
      .select('photo_id')
      .eq('user_id', viewerId);
    (likesData || []).forEach((r) => excludedIds.add(r.photo_id));
  }

  typed = typed.filter((p) => !excludedIds.has(p.id));
  return shuffle(typed).slice(0, limit);
}

/**
 * バトル用: レートが近い2枚をランダム取得。viewerId 未指定時は free のみ。
 * @deprecated SwipeView に移行済み。互換のため残す。
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
 * プロフィール取得（is_admin 含む）
 */
export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, elo_rating, is_admin')
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

/**
 * 写真 1 件取得
 */
export async function getPhotoById(photoId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from('photos')
    .select('id, owner_id, image_url, elo_rating, access_type, tags, is_nsfw')
    .eq('id', photoId)
    .eq('status', 'active')
    .single();
  return data as Photo | null;
}

/**
 * 有効なサブスク（現在日時 < expires_at）
 */
export async function getActiveSubscription(subscriberId: string, creatorId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { data } = await supabase
    .from('subscriptions')
    .select('expires_at')
    .eq('subscriber_id', subscriberId)
    .eq('creator_id', creatorId)
    .gt('expires_at', new Date().toISOString())
    .limit(1);
  return (data?.length ?? 0) > 0;
}

/**
 * 単品購入済みか
 */
export async function hasPurchasedPhoto(buyerId: string, photoId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { count } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', buyerId)
    .eq('photo_id', photoId);
  return (count ?? 0) > 0;
}

/**
 * フォロー中か
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { count } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  return (count ?? 0) > 0;
}

/**
 * 複数写真について閲覧可能か一括取得。viewerId が null の場合は free のみ true。
 */
export async function getBulkPhotoAccess(
  viewerId: string | null,
  photos: { id: string; owner_id: string; access_type: string }[]
): Promise<Record<string, boolean>> {
  const supabase = getSupabase();
  const result: Record<string, boolean> = {};
  if (!supabase) {
    photos.forEach((p) => (result[p.id] = p.access_type === 'free'));
    return result;
  }
  if (!viewerId) {
    photos.forEach((p) => (result[p.id] = p.access_type === 'free'));
    return result;
  }
  const ownerIds = [...new Set(photos.map((p) => p.owner_id))];
  const photoIds = photos.map((p) => p.id);
  const [followsRes, subsRes, purchasesRes] = await Promise.all([
    supabase.from('follows').select('following_id').eq('follower_id', viewerId).in('following_id', ownerIds),
    supabase.from('subscriptions').select('creator_id').eq('subscriber_id', viewerId).gt('expires_at', new Date().toISOString()).in('creator_id', ownerIds),
    supabase.from('purchases').select('photo_id').eq('buyer_id', viewerId).in('photo_id', photoIds),
  ]);
  const followingSet = new Set((followsRes.data || []).map((r) => r.following_id));
  const subSet = new Set((subsRes.data || []).map((r) => r.creator_id));
  const purchasedSet = new Set((purchasesRes.data || []).map((r) => r.photo_id));
  photos.forEach((p) => {
    if (p.access_type === 'free') result[p.id] = true;
    else if (p.access_type === 'follower') result[p.id] = followingSet.has(p.owner_id);
    else result[p.id] = subSet.has(p.owner_id) || purchasedSet.has(p.id);
  });
  return result;
}

/** 管理者: 統計（総売上・ユーザー数・投稿数） */
export async function getAdminStats() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const [revenueRes, usersRes, photosRes] = await Promise.all([
    supabase.from('purchases').select('amount_cents').then((r) => ({ data: r.data, error: r.error })),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_banned', false),
    supabase.from('photos').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);
  const totalRevenue = (revenueRes.data || []).reduce((s, r) => s + (r.amount_cents || 0), 0);
  return {
    totalRevenueCents: totalRevenue,
    activeUsers: usersRes.count ?? 0,
    photoCount: photosRes.count ?? 0,
  };
}

/** 管理者: ユーザー一覧（is_banned 含む） */
export async function getUsersForAdmin(): Promise<{ id: string; display_name: string | null; is_banned: boolean }[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from('profiles').select('id, display_name, is_banned').order('created_at', { ascending: false }).limit(200);
  return (data || []) as { id: string; display_name: string | null; is_banned: boolean }[];
}

/** 管理者: 投稿一覧（検閲用） */
export async function getPhotosForAdmin(limit = 50) {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from('photos')
    .select('id, owner_id, image_url, status, access_type, is_nsfw, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

/** 管理者: 通報一覧 */
export async function getReportsForAdmin() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from('reports')
    .select('id, reporter_id, photo_id, reason, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  return data || [];
}
