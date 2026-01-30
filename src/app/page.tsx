'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, useMotionValue, PanInfo, useAnimation, AnimatePresence } from 'framer-motion';
import { getRandomPhotos, getBulkPhotoAccess, getTimelinePhotos, getFeaturedBattles } from '@/lib/queries';
import { votePhoto } from '@/lib/actions';
import { PhotoWithAccess } from '@/components/PhotoWithAccess';
import { useAuth } from '@/contexts/AuthContext';
import type { Photo } from '@/lib/types';

const springBouncy = { type: 'spring' as const, stiffness: 400, damping: 28 };

function BattleTab({ onNeedLogin }: { onNeedLogin: () => void }) {
  const { userId } = useAuth();
  const [topPhoto, setTopPhoto] = useState<Photo | null>(null);
  const [bottomPhoto, setBottomPhoto] = useState<Photo | null>(null);
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({});
  const [screenHeight, setScreenHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const y = useMotionValue(0);
  const topControls = useAnimation();
  const bottomControls = useAnimation();

  const loadNextPair = useCallback(async () => {
    const pair = await getRandomPhotos(userId);
    if (!pair || pair.length < 2) {
      setTopPhoto(null);
      setBottomPhoto(null);
      setEmpty(true);
      return;
    }
    setEmpty(false);
    setTopPhoto(pair[0]);
    setBottomPhoto(pair[1]);
  }, [userId]);

  useEffect(() => {
    setScreenHeight(window.innerHeight);
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadNextPair().finally(() => setLoading(false));
  }, [loadNextPair]);

  useEffect(() => {
    if (!topPhoto || !bottomPhoto) return;
    getBulkPhotoAccess(userId, [topPhoto, bottomPhoto]).then(setAccessMap);
  }, [topPhoto, bottomPhoto, userId]);

  function triggerHearts() {
    const newHearts = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 - 40,
      y: Math.random() * -60 - 20,
    }));
    setHearts(newHearts);
    setTimeout(() => setHearts([]), 800);
  }

  async function handleUnlock(photo: Photo) {
    if (!userId) {
      onNeedLogin();
      return;
    }
    try {
      const res = await fetch('/api/stripe/checkout-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: photo.id,
          userId,
          successUrl: `${window.location.origin}/?unlocked=1`,
          cancelUrl: window.location.origin + '/',
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // ignore
    }
  }

  const handleDragEnd = async (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 100;
    const velocity = Math.abs(info.velocity.y);

    if (
      (Math.abs(info.offset.y) > threshold || velocity > 500) &&
      topPhoto &&
      bottomPhoto &&
      !swiping
    ) {
      if (!userId) {
        onNeedLogin();
        y.set(0);
        return;
      }

      const isSwipingDown = info.offset.y > 0;
      setSwiping(true);
      if (userId) triggerHearts();

      if (isSwipingDown) {
        topControls.start({ y: screenHeight / 2, transition: springBouncy });
        bottomControls.start({ y: -screenHeight / 2, transition: springBouncy });
      } else {
        topControls.start({ y: -screenHeight / 2, transition: springBouncy });
        bottomControls.start({ y: screenHeight / 2, transition: springBouncy });
      }

      const winnerId = isSwipingDown ? bottomPhoto.id : topPhoto.id;
      const loserId = isSwipingDown ? topPhoto.id : bottomPhoto.id;
      votePhoto(winnerId, loserId, userId);

      setTimeout(async () => {
        topControls.set({ y: 0 });
        bottomControls.set({ y: 0 });
        y.set(0);
        const pair = await getRandomPhotos(userId);
        if (pair && pair.length >= 2) {
          setTopPhoto(pair[0]);
          setBottomPhoto(pair[1]);
        } else {
          setTopPhoto(null);
          setBottomPhoto(null);
          setEmpty(true);
        }
        setSwiping(false);
      }, 350);
    } else {
      y.set(0);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.p
          animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-candy-text font-medium"
        >
          読み込み中...
        </motion.p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-6 text-center">
        <p className="text-candy-text font-medium">写真がまだないよ。投稿をお待ちしてます💕</p>
        <Link href="/upload" className="candy-btn jelly-pink px-8 py-4 text-lg font-bold">
          投稿する
        </Link>
      </div>
    );
  }

  if (!topPhoto || !bottomPhoto) return null;

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-t-3xl sm:mx-auto sm:max-w-lg">
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.span
            key={h.id}
            initial={{ opacity: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, x: h.x, y: h.y }}
            transition={{ duration: 0.7 }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-30 text-2xl"
          >
            💕
          </motion.span>
        ))}
      </AnimatePresence>

      <motion.div
        className="absolute top-0 left-0 h-1/2 w-full overflow-hidden rounded-b-3xl border-[3px] border-candy-peach/30 bg-white shadow-candy-card"
        animate={topControls}
        style={{ y }}
      >
        <PhotoWithAccess
          photo={topPhoto}
          canView={accessMap[topPhoto.id] ?? topPhoto.access_type === 'free'}
          variant="battle"
          onUnlockClick={handleUnlock}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 h-1/2 w-full overflow-hidden rounded-t-3xl border-[3px] border-candy-peach/30 bg-white shadow-candy-card"
        animate={bottomControls}
        style={{ y }}
      >
        <PhotoWithAccess
          photo={bottomPhoto}
          canView={accessMap[bottomPhoto.id] ?? bottomPhoto.access_type === 'free'}
          variant="battle"
          onUnlockClick={handleUnlock}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 z-10 cursor-grab touch-none active:cursor-grabbing"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.25}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        <div className="h-full w-full" />
      </motion.div>

      <div className="pointer-events-none absolute left-0 top-1/2 z-20 h-1 w-full -translate-y-1/2 rounded-full bg-white/70 shadow-lg" />
    </div>
  );
}

function TimelineTabContent({ onNeedLogin }: { onNeedLogin: () => void }) {
  const { userId } = useAuth();
  const [timeline, setTimeline] = useState<Photo[] | null>(null);
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({});
  const [featured, setFeatured] = useState<{ winner_id: string; loser_id: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTimeline([]);
      setFeatured([]);
      setLoading(false);
      return;
    }
    Promise.all([getTimelinePhotos(userId), getFeaturedBattles(5)]).then(([tl, fb]) => {
      setTimeline(tl || []);
      setFeatured(fb || []);
      setLoading(false);
    });
  }, [userId]);

  useEffect(() => {
    if (!timeline?.length || !userId) {
      if (timeline?.length) {
        const m: Record<string, boolean> = {};
        timeline.forEach((p) => (m[p.id] = p.access_type === 'free'));
        setAccessMap(m);
      }
      return;
    }
    getBulkPhotoAccess(userId, timeline).then(setAccessMap);
  }, [timeline, userId]);

  async function handleUnlock(photo: Photo) {
    if (!userId) {
      onNeedLogin();
      return;
    }
    try {
      const res = await fetch('/api/stripe/checkout-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: photo.id,
          userId,
          successUrl: `${window.location.origin}/?tab=timeline&unlocked=1`,
          cancelUrl: `${window.location.origin}/`,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // ignore
    }
  }

  if (!userId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="candy-card mb-6 p-6 text-center"
        >
          <p className="mb-4 text-candy-text">ログインするとフォロー中の投稿がここに表示されるよ💕</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onNeedLogin}
            className="candy-btn jelly-pink px-6 py-3 font-bold"
          >
            ログインする
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <motion.p
          animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-candy-text font-medium"
        >
          読み込み中...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {timeline && timeline.length > 0 ? (
        <ul className="mb-10 space-y-4">
          {timeline.map((photo, i) => (
            <motion.li
              key={photo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="candy-card overflow-hidden"
            >
              <div className="relative aspect-[4/5] w-full">
                <PhotoWithAccess
                  photo={photo}
                  canView={accessMap[photo.id] ?? photo.access_type === 'free'}
                  variant="full"
                  onUnlockClick={handleUnlock}
                  href={`/profile/${photo.owner_id}`}
                />
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="font-mono font-bold text-candy-peach">Elo {photo.elo_rating}</span>
                <Link
                  href={`/profile/${photo.owner_id}`}
                  className="rounded-xl border-2 border-candy-lavender/50 px-3 py-1.5 text-xs font-medium text-candy-text"
                >
                  投稿者
                </Link>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="mb-10 text-candy-text/70">フォロー中の投稿はまだないよ。</p>
      )}

      <h2 className="mb-4 text-lg font-bold text-candy-text">注目のバトル</h2>
      {featured.length === 0 ? (
        <p className="text-candy-text/70">まだバトル記録がないよ。</p>
      ) : (
        <ul className="space-y-3">
          {featured.map((b, i) => (
            <motion.li
              key={`${b.winner_id}-${b.loser_id}-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="candy-card px-4 py-3 text-sm text-candy-text"
            >
              対戦記録（勝者 / 敗者）
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const { openLoginModal } = useAuth();
  const [tab, setTab] = useState<'battle' | 'timeline'>(searchParams.get('tab') === 'timeline' ? 'timeline' : 'battle');

  useEffect(() => {
    if (searchParams.get('tab') === 'timeline') setTab('timeline');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-candy-cream">
      <div className="mx-auto max-w-lg">
        <div className="flex gap-1 rounded-2xl border-[3px] border-candy-lavender/50 bg-white p-1.5 shadow-candy-card">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => setTab('battle')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
              tab === 'battle'
                ? 'bg-candy-peach text-white shadow-candy-jelly'
                : 'text-candy-text/70'
            }`}
          >
            バトル
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setTab('timeline');
            }}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
              tab === 'timeline'
                ? 'bg-candy-mint text-white shadow-candy-jelly'
                : 'text-candy-text/70'
            }`}
          >
            タイムライン
          </motion.button>
        </div>

        <div className="mt-4">
          {tab === 'battle' ? (
            <BattleTab onNeedLogin={openLoginModal} />
          ) : (
            <TimelineTabContent onNeedLogin={openLoginModal} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center bg-candy-cream"><p className="text-candy-text">読み込み中...</p></div>}>
      <HomeContent />
    </Suspense>
  );
}
