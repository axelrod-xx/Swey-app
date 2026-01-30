import { supabase } from './supabase';
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
 * photos テーブルから、表示用の写真をランダム（またはレートが近い2枚）で取得する。
 * status='active', access_type='free' に限定。データが少ない場合は単純ランダムで2枚。
 */
export async function getRandomPhotos(): Promise<Photo[] | null> {
  const { data: photos, error } = await supabase
    .from('photos')
    .select('id, owner_id, image_url, elo_rating')
    .eq('status', 'active')
    .eq('access_type', 'free')
    .limit(500);

  if (error) {
    console.error('getRandomPhotos error:', error);
    return null;
  }

  if (!photos || photos.length < 2) {
    return null;
  }

  const typed = photos as Photo[];

  if (typed.length < MIN_PHOTOS_FOR_SIMILAR_ELO) {
    return shuffle(typed).slice(0, 2);
  }

  const sorted = [...typed].sort((a, b) => a.elo_rating - b.elo_rating);
  const pairIndex = Math.floor(Math.random() * (sorted.length - 1));
  const pair = [sorted[pairIndex], sorted[pairIndex + 1]];
  return shuffle(pair);
}
