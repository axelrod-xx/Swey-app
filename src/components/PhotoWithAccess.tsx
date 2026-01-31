'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Photo } from '@/lib/types';

type Props = {
  photo: Photo;
  canView: boolean;
  variant?: 'full' | 'thumb' | 'battle';
  onUnlockClick?: (photo: Photo) => void;
  href?: string;
};

export function PhotoWithAccess({ photo, canView, variant = 'full', onUnlockClick, href }: Props) {
  const isFollowerOnly = photo.access_type === 'follower';
  const isPaid = photo.access_type === 'paid';

  const overlay = !canView && (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/60 p-4 backdrop-blur-md">
      <p className="text-center text-sm font-semibold text-white">
        {isFollowerOnly ? 'フォローすると見られます' : isPaid ? 'サブスク or 購入で見られます' : '閲覧できません'}
      </p>
      {isPaid && (
        <button
          type="button"
          onClick={() => onUnlockClick?.(photo)}
          className="btn-primary px-5 py-2.5 text-sm"
        >
          アンロック
        </button>
      )}
      {isFollowerOnly && href && (
        <Link href={href} className="btn-secondary px-5 py-2.5 text-sm">
          フォローして見る
        </Link>
      )}
    </div>
  );

  const content = (
    <>
      <Image
        src={photo.image_url}
        alt=""
        fill
        className={`object-cover ${!canView ? 'blur-xl scale-110' : ''}`}
        sizes={variant === 'battle' ? '100vw' : variant === 'thumb' ? '33vw' : '(max-width: 512px) 100vw, 512px'}
        unoptimized
      />
      {overlay}
    </>
  );

  if (variant === 'battle') {
    return (
      <motion.div className="relative h-full w-full overflow-hidden rounded-2xl">
        {content}
      </motion.div>
    );
  }

  const wrapperClass =
    variant === 'thumb'
      ? 'relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm'
      : 'relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm';

  return <div className={wrapperClass}>{content}</div>;
}
