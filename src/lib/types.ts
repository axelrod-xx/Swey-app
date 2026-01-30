/** DB: public.photos */
export type Photo = {
  id: string;
  owner_id: string;
  image_url: string;
  elo_rating: number;
};

/** DB: public.battles (winner_id, loser_id, voter_id) */
export type BattleRecord = {
  winner_id: string;
  loser_id: string;
  voter_id: string | null;
};
