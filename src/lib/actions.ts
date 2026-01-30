'use server';

import { createClient } from '@supabase/supabase-js';

const K = 32;

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function newRating(current: number, expected: number, actual: number): number {
  return Math.round(current + K * (actual - expected));
}

/**
 * バトル結果を保存し、Elo で双方の photos.elo_rating を更新する。
 * R'_A = R_A + K(S_A - E_A), E_A = 1 / (1 + 10^((R_B - R_A)/400))
 * battles には winner_id, loser_id, voter_id（未ログイン時は null）を挿入。
 */
export async function recordBattle(
  winnerPhotoId: string,
  loserPhotoId: string,
  voterId: string | null = null
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: photos, error: fetchError } = await supabase
    .from('photos')
    .select('id, elo_rating')
    .in('id', [winnerPhotoId, loserPhotoId]);

  if (fetchError || !photos || photos.length !== 2) {
    console.error('recordBattle: fetch photos failed', fetchError);
    return { ok: false, error: '写真の取得に失敗しました' };
  }

  const winner = photos.find((p) => p.id === winnerPhotoId);
  const loser = photos.find((p) => p.id === loserPhotoId);
  if (!winner || !loser) {
    return { ok: false, error: '対象の写真が見つかりません' };
  }

  const Rw = winner.elo_rating;
  const Rl = loser.elo_rating;
  const Ew = expectedScore(Rw, Rl);
  const El = expectedScore(Rl, Rw);

  const newWinnerRating = newRating(Rw, Ew, 1);
  const newLoserRating = newRating(Rl, El, 0);

  const { error: updateWinnerError } = await supabase
    .from('photos')
    .update({ elo_rating: newWinnerRating })
    .eq('id', winnerPhotoId);

  const { error: updateLoserError } = await supabase
    .from('photos')
    .update({ elo_rating: newLoserRating })
    .eq('id', loserPhotoId);

  if (updateWinnerError || updateLoserError) {
    console.error('recordBattle: update elo failed', updateWinnerError || updateLoserError);
    return { ok: false, error: 'レートの更新に失敗しました' };
  }

  const { error: insertError } = await supabase.from('battles').insert({
    winner_id: winnerPhotoId,
    loser_id: loserPhotoId,
    voter_id: voterId,
  });

  if (insertError) {
    console.error('recordBattle: insert battle failed', insertError);
    return { ok: false, error: '対戦記録の保存に失敗しました' };
  }

  return { ok: true };
}
