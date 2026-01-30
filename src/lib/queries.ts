import { getSupabase } from './supabase';
import type { Photo } from './types';

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
 * レートが近い2枚をランダムに取得。少ない場合は単純ランダム。
 * status='active', access_type='free' に限定。
 */
export async function getRandomPhotos(): Promise<Photo[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: photos, error } = await supabase
    .from('photos')
    .select('id, owner_id, image_url, elo_rating')
    .eq('status', 'active')
    .eq('access_type', 'free')
    .limit(500);

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
 * 総合ランキング Top 10（elo_rating 降順）
 */
export async function getTopRanking(): Promise<Photo[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('photos')
    .select('id, owner_id, image_url, elo_rating')
    .eq('status', 'active')
    .order('elo_rating', { ascending: false })
    .limit(10);

  if (error) return null;
  return (data || null) as Photo[] | null;
}
