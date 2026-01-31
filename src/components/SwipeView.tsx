'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { Heart, X } from '@phosphor-icons/react';
import { getSwipePhotos, getBulkPhotoAccess } from '@/lib/queries';
import { likePhoto } from '@/lib/actions';
import { PhotoWithAccess } from '@/components/PhotoWithAccess';
import { useAuth } from '@/contexts/AuthContext';
import type { Photo } from '@/lib/types';

const SWIPE_THRESHOLD = 80;
const DECK_SIZE = 10;

export function SwipeView() {
  const { userId, openLoginModal } = useAuth();
  const [deck, setDeck] = useState<Photo[]>([]);
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [exitX, setExitX] = useState(0);
  const [direction, setDirection] = useState<'like' | 'pass' | null>(null);

  const loadMore = useCallback(
    async (excludeIds: string[]) => getSwipePhotos(userId, DECK_SIZE, excludeIds),
    [userId]
  );

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const currentPhoto = deck[0];
  const currentPhotoId = currentPhoto?.id;

  useEffect(() => {
    let cancelled = false;
    getSwipePhotos(userId, DECK_SIZE).then((photos) => {
      if (cancelled) return;
      setDeck(photos || []);
      setEmpty(!photos?.length);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    x.set(0);
    setDirection(null);
  }, [currentPhotoId, x]);

  useEffect(() => {
    if (!deck.length || !userId) {
      if (deck.length) {
        const m: Record<string, boolean> = {};
        deck.forEach((p) => (m[p.id] = p.access_type === 'free'));
        setAccessMap(m);
      }
      return;
    }
    getBulkPhotoAccess(userId, deck).then(setAccessMap);
  }, [deck, userId]);

  async function handleSwipe(photo: Photo | undefined, action: 'like' | 'pass') {
    if (!photo) return;
    if (!userId) {
      openLoginModal?.();
      return;
    }

    const sign = action === 'like' ? 1 : -1;
    setExitX(sign * 400);
    setDirection(action);

    await likePhoto(userId, photo.id, action);

    const nextDeck = deck.slice(1);
    setDeck(nextDeck);

    if (nextDeck.length <= 2) {
      const excludeIds = deck.map((p) => p.id);
      loadMore(excludeIds).then((more) =>
        setDeck((prev) => [...prev, ...more])
      );
    }
  }

  function handleDragEnd(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;

    if (Math.abs(offsetX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 400) {
      const action: 'like' | 'pass' = offsetX > 0 || velocityX > 0 ? 'like' : 'pass';
      handleSwipe(currentPhoto, action);
    } else {
      x.set(0);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-slate-500"
        >
          読み込み中...
        </motion.p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-slate-600">
          写真がまだありません。投稿をお待ちしています
        </p>
        <Link href="/upload" className="btn-primary">
          投稿する
        </Link>
      </div>
    );
  }

  if (!currentPhoto) return null;

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-6 md:min-h-[75vh]">
      <div className="relative h-[min(85vw,420px)] w-full max-w-sm">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentPhoto.id}
            className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            style={{ x, rotate }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              x: exitX,
              opacity: 0,
              scale: 0.9,
              transition: { duration: 0.25 },
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
              <PhotoWithAccess
                photo={currentPhoto}
                canView={accessMap[currentPhoto.id] ?? currentPhoto.access_type === 'free'}
                variant="battle"
                href={`/profile/${currentPhoto.owner_id}`}
              />

              {/* LIKE overlay (right) */}
              <motion.div
                style={{ opacity: likeOpacity }}
                className="pointer-events-none absolute inset-0 flex items-center justify-end rounded-2xl border-4 border-pink-400/80 bg-gradient-to-l from-pink-500/30 to-transparent"
              >
                <div className="mr-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-pink-400 bg-white/90 shadow-lg">
                  <Heart size={40} weight="fill" className="text-pink-500" />
                </div>
              </motion.div>

              {/* PASS overlay (left) */}
              <motion.div
                style={{ opacity: passOpacity }}
                className="pointer-events-none absolute inset-0 flex items-center justify-start rounded-2xl border-4 border-slate-300/80 bg-gradient-to-r from-slate-400/30 to-transparent"
              >
                <div className="ml-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-400 bg-white/90 shadow-lg">
                  <X size={40} weight="bold" className="text-slate-500" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex items-center justify-center gap-8">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe(currentPhoto, 'pass')}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-200 bg-white shadow-md hover:bg-slate-50"
          aria-label="PASS"
        >
          <X size={28} weight="bold" className="text-slate-500" />
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe(currentPhoto, 'like')}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl"
          aria-label="LIKE"
        >
          <Heart size={28} weight="fill" />
        </motion.button>
      </div>

      <p className="mt-4 text-xs text-slate-400">スワイプ or ボタンで操作</p>
    </div>
  );
}
