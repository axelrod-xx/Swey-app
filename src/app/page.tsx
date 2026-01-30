'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, PanInfo, useAnimation } from 'framer-motion';
import { getRandomPhotos } from '@/lib/queries';
import { votePhoto } from '@/lib/actions';
import type { Photo } from '@/lib/types';

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
        topControls.start({ y: screenHeight / 2, transition: { duration: 0.3 } });
        bottomControls.start({ y: -screenHeight / 2, transition: { duration: 0.3 } });
      } else {
        topControls.start({ y: -screenHeight / 2, transition: { duration: 0.3 } });
        bottomControls.start({ y: screenHeight / 2, transition: { duration: 0.3 } });
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
      }, 300);
    } else {
      y.set(0);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-zinc-500">読み込み中...</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6 text-center">
        <p className="text-lg text-zinc-400">写真がありません。投稿をお待ちください。</p>
        <Link
          href="/upload"
          className="rounded-xl bg-[#8B1538] px-6 py-3 font-medium text-white transition hover:bg-[#E63946]"
        >
          投稿する
        </Link>
      </div>
    );
  }

  if (!topPhoto || !bottomPhoto) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black sm:mx-auto sm:max-w-lg">
      <motion.div
        className="absolute top-0 left-0 h-1/2 w-full relative"
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
        className="absolute bottom-0 left-0 h-1/2 w-full relative"
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
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        <div className="h-full w-full" />
      </motion.div>

      <div className="absolute top-1/2 left-0 z-20 h-0.5 w-full -translate-y-1/2 bg-white/30 pointer-events-none" />
    </div>
  );
}
