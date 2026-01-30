'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, PanInfo, useAnimation } from 'framer-motion';
import { getRandomPhotos } from '@/lib/queries';
import { votePhoto } from '@/lib/actions';
import type { Photo } from '@/lib/types';

const springBouncy = { type: 'spring' as const, stiffness: 400, damping: 28 };

export default function BattlePage() {
  const [topPhoto, setTopPhoto] = useState<Photo | null>(null);
  const [bottomPhoto, setBottomPhoto] = useState<Photo | null>(null);
  const [screenHeight, setScreenHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [swiping, setSwiping] = useState(false);

  const y = useMotionValue(0);
  const topControls = useAnimation();
  const bottomControls = useAnimation();

  const loadNextPair = useCallback(async () => {
    const pair = await getRandomPhotos(null);
    if (!pair || pair.length < 2) {
      setTopPhoto(null);
      setBottomPhoto(null);
      setEmpty(true);
      return;
    }
    setEmpty(false);
    setTopPhoto(pair[0]);
    setBottomPhoto(pair[1]);
  }, []);

  useEffect(() => {
    setScreenHeight(window.innerHeight);
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadNextPair().finally(() => setLoading(false));
  }, [loadNextPair]);

  const handleDragEnd = async (
    _event: MouseEvent | TouchEvent | PointerEvent,
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
      const isSwipingDown = info.offset.y > 0;
      setSwiping(true);

      if (isSwipingDown) {
        topControls.start({ y: screenHeight / 2, transition: springBouncy });
        bottomControls.start({ y: -screenHeight / 2, transition: springBouncy });
      } else {
        topControls.start({ y: -screenHeight / 2, transition: springBouncy });
        bottomControls.start({ y: screenHeight / 2, transition: springBouncy });
      }

      const winnerId = isSwipingDown ? bottomPhoto.id : topPhoto.id;
      const loserId = isSwipingDown ? topPhoto.id : bottomPhoto.id;
      votePhoto(winnerId, loserId, null);

      setTimeout(async () => {
        topControls.set({ y: 0 });
        bottomControls.set({ y: 0 });
        y.set(0);

        const pair = await getRandomPhotos(null);
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pop-cream to-pop-lavender">
        <motion.p
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-lg font-medium text-pop-text"
        >
          読み込み中...
        </motion.p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-pop-cream to-pop-lavender px-6 text-center">
        <p className="text-lg font-medium text-pop-text">写真がありません。投稿をお待ちください。</p>
        <Link
          href="/upload"
          className="pop-btn rounded-3xl bg-gradient-to-r from-[#FF6B9D] to-[#FF9F43] px-8 py-4 font-bold text-white shadow-pop"
        >
          投稿する
        </Link>
      </div>
    );
  }

  if (!topPhoto || !bottomPhoto) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden rounded-t-3xl bg-pop-cream sm:mx-auto sm:max-w-lg">
      <motion.div
        className="absolute top-0 left-0 h-1/2 w-full relative rounded-b-3xl overflow-hidden shadow-popCard"
        animate={topControls}
        style={{ y }}
      >
        <Image
          src={topPhoto.image_url}
          alt="Top"
          fill
          className="object-cover"
          draggable={false}
          sizes="100vw"
          unoptimized
        />
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 h-1/2 w-full relative rounded-t-3xl overflow-hidden shadow-popCard"
        animate={bottomControls}
        style={{ y }}
      >
        <Image
          src={bottomPhoto.image_url}
          alt="Bottom"
          fill
          className="object-cover"
          draggable={false}
          sizes="100vw"
          unoptimized
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing touch-none"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.25}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        <div className="h-full w-full" />
      </motion.div>

      <div className="absolute top-1/2 left-0 z-20 h-1 w-full -translate-y-1/2 rounded-full bg-white/60 shadow-lg pointer-events-none" />
    </div>
  );
}
