/** photos.tags: 部位(part), 作品名(title), キャラ名(character) */
export type PhotoTags = {
  part?: string;
  title?: string;
  character?: string;
  [key: string]: string | undefined;
};

export type AccessType = 'free' | 'follower' | 'paid';

/** DB: public.photos */
export type Photo = {
  id: string;
  owner_id: string;
  image_url: string;
  elo_rating: number;
  access_type: AccessType;
  tags?: PhotoTags | null;
  is_nsfw?: boolean;
};

/** DB: public.profiles */
export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  elo_rating: number;
  is_admin?: boolean;
};

/** DB: public.battles */
export type BattleRecord = {
  winner_id: string;
  loser_id: string;
  voter_id: string | null;
};

/** DB: public.follows */
export type Follow = {
  follower_id: string;
  following_id: string;
};

/** DB: public.messages */
export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

/** DB: public.subscriptions */
export type Subscription = {
  subscriber_id: string;
  creator_id: string;
  expires_at: string;
};

/** DB: public.purchases */
export type Purchase = {
  id: string;
  buyer_id: string;
  photo_id: string;
  amount_cents: number;
  stripe_payment_intent_id: string | null;
  created_at: string;
};

/** DB: public.payouts */
export type Payout = {
  id: string;
  creator_id: string;
  amount_cents: number;
  status: 'pending' | 'paid' | 'failed';
  stripe_payout_id: string | null;
  created_at: string;
  paid_at: string | null;
};

/** DB: public.likes (swipe: like / pass) */
export type LikeRecord = {
  id: string;
  user_id: string;
  photo_id: string;
  action: 'like' | 'pass';
  created_at: string;
};

/** DB: public.reports */
export type Report = {
  id: string;
  reporter_id: string;
  photo_id: string;
  reason: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
};
