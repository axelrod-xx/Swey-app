'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, getPhotosByOwner, getFollowerCount, getBulkPhotoAccess } from '@/lib/queries';
import { followUser, unfollowUser, reportPhoto } from '@/lib/actions';
import { PhotoWithAccess } from '@/components/PhotoWithAccess';
import { toast } from 'sonner';
import type { Photo, Profile } from '@/lib/types';

export default function ProfileIdPage() {
  const { userId: CURRENT_USER_ID, openLoginModal } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const justSubscribed = searchParams.get('subscribed') === '1';
  const justUnlocked = searchParams.get('unlocked') === '1';
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({});
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

  useEffect(() => {
    if (!photos?.length || !CURRENT_USER_ID) {
      if (photos?.length) {
        const m: Record<string, boolean> = {};
        photos.forEach((p) => (m[p.id] = p.access_type === 'free'));
        setAccessMap(m);
      }
      return;
    }
    getBulkPhotoAccess(CURRENT_USER_ID, photos).then(setAccessMap);
  }, [photos, CURRENT_USER_ID]);

  async function handleFollow() {
    if (!CURRENT_USER_ID || !id) {
      openLoginModal?.();
      return;
    }
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
    if (!CURRENT_USER_ID || !id) {
      openLoginModal?.();
      return;
    }
    try {
      const res = await fetch('/api/stripe/checkout-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: id,
          userId: CURRENT_USER_ID,
          successUrl: `${window.location.origin}/profile/${id}?subscribed=1`,
          cancelUrl: `${window.location.origin}/profile/${id}`,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error || 'サブスク開始に失敗しました');
    } catch {
      toast.error('サブスク開始に失敗しました');
    }
  }

  async function handleReport(photo: Photo) {
    if (!CURRENT_USER_ID) {
      openLoginModal?.();
      return;
    }
    const reason = window.prompt('通報理由（任意）');
    const r = await reportPhoto(CURRENT_USER_ID, photo.id, reason || '');
    if (r.ok) toast.success('通報を受け付けました');
    else toast.error(r.error || '送信に失敗しました');
  }

  async function handleUnlock(photo: Photo) {
    if (!CURRENT_USER_ID) {
      openLoginModal?.();
      return;
    }
    try {
      const res = await fetch('/api/stripe/checkout-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: photo.id,
          userId: CURRENT_USER_ID,
          successUrl: `${window.location.origin}/profile/${id}?unlocked=1`,
          cancelUrl: `${window.location.origin}/profile/${id}`,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error || 'アンロックに失敗しました');
    } catch {
      toast.error('アンロックに失敗しました');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-candy-cream">
        <p className="text-candy-text">読み込み中...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg bg-candy-cream px-4 py-12 text-center">
        <p className="text-candy-text/80">ユーザーが見つからないよ。</p>
        <Link href="/" className="mt-4 inline-block candy-btn jelly-pink px-6 py-3 font-bold">
          ホームへ
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg bg-candy-cream px-4 py-8">
      {(justSubscribed || justUnlocked) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="candy-card mb-4 p-4 text-center"
        >
          <p className="font-bold text-candy-text">
            {justSubscribed ? '🎉 サブスク登録ありがとう！' : '🔓 アンロック完了！'}
          </p>
        </motion.div>
      )}
      <div className="candy-card mb-6 flex items-center gap-4 p-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-[3px] border-candy-lavender/50 bg-candy-lavender/30">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-candy-text/50">?</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-candy-text">
            {profile.display_name || '名無し'}
          </h1>
          <p className="font-mono text-sm font-bold text-candy-peach">Elo {profile.elo_rating}</p>
          <p className="text-xs text-candy-text/70">フォロワー {followerCount}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CURRENT_USER_ID && CURRENT_USER_ID !== id && (
          <>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleFollow}
              className="candy-btn jelly-pink px-4 py-2 text-sm font-bold"
            >
              フォロー
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleUnfollow}
              className="candy-btn jelly-outline px-4 py-2 text-sm font-medium"
            >
              フォロー解除
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleSubscribe}
              className="rounded-2xl border-[3px] border-candy-mint bg-candy-mint/15 px-4 py-2 text-sm font-medium text-candy-mint shadow-candy-card"
            >
              サブスク
            </motion.button>
          </>
        )}
        <Link href="/messages" className="candy-btn jelly-outline px-4 py-2 text-sm font-medium">
          DM
        </Link>
      </div>

      <h2 className="mb-4 text-sm font-bold text-candy-text">投稿一覧</h2>
      {!photos?.length ? (
        <p className="text-candy-text/70">まだ投稿がないよ。</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <li key={photo.id} className="relative aspect-square overflow-hidden rounded-2xl">
              <PhotoWithAccess
                photo={photo}
                canView={accessMap[photo.id] ?? photo.access_type === 'free'}
                variant="thumb"
                onUnlockClick={handleUnlock}
                href={`/profile/${id}`}
              />
              <span className="absolute bottom-1 left-1 z-20 rounded-xl bg-black/60 px-1.5 py-0.5 font-mono text-xs font-bold text-candy-peach">
                {photo.elo_rating}
              </span>
              {CURRENT_USER_ID && id !== CURRENT_USER_ID && (
                <button
                  type="button"
                  onClick={() => handleReport(photo)}
                  className="absolute bottom-1 right-1 z-20 rounded-lg bg-black/50 px-1.5 py-0.5 text-[10px] text-white hover:bg-black/70"
                >
                  通報
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
