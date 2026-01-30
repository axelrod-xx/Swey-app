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
