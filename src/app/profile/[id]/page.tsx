'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProfile, getPhotosByOwner, getFollowerCount } from '@/lib/queries';
import { followUser, unfollowUser, subscribeCreator } from '@/lib/actions';
import { toast } from 'sonner';
import type { Photo, Profile } from '@/lib/types';

const CURRENT_USER_ID = process.env.NEXT_PUBLIC_ANONYMOUS_OWNER_ID || null;

export default function ProfileIdPage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([getProfile(id), getPhotosByOwner(id), getFollowerCount(id)]).then(
      ([p, ph, fc]) => {
        setProfile(p || null);
        setPhotos(ph || null);
        setFollowerCount(fc ?? 0);
        setLoading(false);
      }
    );
  }, [id]);

  async function handleFollow() {
    if (!CURRENT_USER_ID || !id) return;
    const result = await followUser(CURRENT_USER_ID, id);
    if (result.ok) {
      setFollowerCount((c) => c + 1);
      toast.success('フォローしました');
    } else {
      toast.error(result.error || 'フォローに失敗しました');
    }
  }

  async function handleUnfollow() {
    if (!CURRENT_USER_ID || !id) return;
    const result = await unfollowUser(CURRENT_USER_ID, id);
    if (result.ok) {
      setFollowerCount((c) => Math.max(0, c - 1));
      toast.success('フォロー解除しました');
    } else {
      toast.error(result.error || '解除に失敗しました');
    }
  }

  async function handleSubscribe() {
    if (!CURRENT_USER_ID || !id) return;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    const result = await subscribeCreator(CURRENT_USER_ID, id, expiresAt);
    if (result.ok) toast.success('サブスク登録しました');
    else toast.error(result.error || '登録に失敗しました');
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pop-cream to-pop-lavender">
        <p className="text-pop-text">読み込み中...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg bg-pop-cream px-4 py-12 text-center">
        <p className="text-pop-text/80">ユーザーが見つかりません。</p>
        <Link href="/" className="mt-4 inline-block rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF9F43] px-6 py-3 font-bold text-white shadow-pop hover:opacity-90">
          ホームへ
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg bg-pop-cream px-4 py-8">
      <div className="mb-6 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-popCard">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-pop-lavender bg-pop-lavender/50">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-pop-text/50">?</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-pop-text">
            {profile.display_name || '名無し'}
          </h1>
          <p className="font-mono text-sm font-bold text-[#FF6B9D]">Elo {profile.elo_rating}</p>
          <p className="text-xs text-pop-text/70">フォロワー {followerCount}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CURRENT_USER_ID && CURRENT_USER_ID !== id && (
          <>
            <button
              type="button"
              onClick={handleFollow}
              className="pop-btn rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF9F43] px-4 py-2 text-sm font-bold text-white shadow-pop"
            >
              フォロー
            </button>
            <button
              type="button"
              onClick={handleUnfollow}
              className="rounded-2xl border-2 border-pop-lavender bg-white px-4 py-2 text-sm font-medium text-pop-text shadow-popCard hover:bg-pop-lavender/30"
            >
              フォロー解除
            </button>
            <button
              type="button"
              onClick={handleSubscribe}
              className="rounded-2xl border-2 border-[#6BCB77] bg-[#6BCB77]/15 px-4 py-2 text-sm font-medium text-[#6BCB77] shadow-popCard hover:bg-[#6BCB77]/25"
            >
              サブスク
            </button>
          </>
        )}
        <Link
          href="/messages"
          className="rounded-2xl border-2 border-pop-lavender bg-white px-4 py-2 text-sm font-medium text-pop-text shadow-popCard hover:bg-pop-lavender/30"
        >
          DM
        </Link>
      </div>

      <h2 className="mb-4 text-sm font-bold text-pop-text">投稿一覧</h2>
      {!photos?.length ? (
        <p className="text-pop-text/70">まだ投稿がありません。</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <li key={photo.id} className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-popCard">
              <Image
                src={photo.image_url}
                alt=""
                fill
                className="object-cover"
                sizes="33vw"
                unoptimized
              />
              <span className="absolute bottom-1 left-1 rounded-xl bg-black/60 px-1.5 py-0.5 font-mono text-xs font-bold text-[#FF9F43]">
                {photo.elo_rating}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
