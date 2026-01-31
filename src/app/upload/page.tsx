'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CloudArrowUp } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadPhoto } from '@/lib/actions';
import { toast } from 'sonner';

export default function UploadPage() {
  const { userId, openLoginModal } = useAuth();
  const [uploading, setUploading] = useState(false);

  if (!userId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-card max-w-sm p-8"
        >
          <p className="mb-2 flex items-center justify-center gap-2 text-xl font-bold text-slate-900">
            <CloudArrowUp size={26} weight="regular" className="text-slate-400" />
            ログインして投稿しよう
          </p>
          <p className="mb-6 text-sm text-slate-500">写真の投稿はログイン後に利用できます</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={openLoginModal}
            className="btn-primary w-full py-4"
          >
            ログインする
          </motion.button>
          <Link href="/" className="mt-4 block text-sm font-medium text-indigo-600 hover:underline">
            トップへ戻る
          </Link>
        </motion.div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('userId', userId);
    const tags: Record<string, string> = {};
    const part = (form.querySelector('[name="part"]') as HTMLInputElement)?.value;
    const title = (form.querySelector('[name="title"]') as HTMLInputElement)?.value;
    const character = (form.querySelector('[name="character"]') as HTMLInputElement)?.value;
    if (part) tags.part = part;
    if (title) tags.title = title;
    if (character) tags.character = character;
    if (Object.keys(tags).length) formData.set('tags', JSON.stringify(tags));
    setUploading(true);
    try {
      const result = await uploadPhoto(formData);
      if (result.ok) {
        toast.success('アップロードしました');
        form.reset();
      } else {
        toast.error(result.error || 'アップロードに失敗しました');
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-900">
        <CloudArrowUp size={28} weight="regular" className="text-slate-400" />
        写真を投稿
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">画像ファイル</span>
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            disabled={uploading}
            className="modern-input block w-full file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:font-medium file:text-white file:transition hover:file:bg-indigo-700"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">部位</span>
            <input type="text" name="part" className="modern-input w-full py-2 text-sm" placeholder="例: 目" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">作品名</span>
            <input type="text" name="title" className="modern-input w-full py-2 text-sm" placeholder="例: 〇〇の〇" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">キャラ名</span>
            <input type="text" name="character" className="modern-input w-full py-2 text-sm" placeholder="例: キャラ名" />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">公開範囲</span>
          <select name="access_type" className="modern-input w-full">
            <option value="free">誰でも</option>
            <option value="follower">フォロワーのみ</option>
            <option value="paid">サブスクのみ</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_nsfw" value="true" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          <span className="text-sm text-slate-700">NSFW（センシティブ）</span>
        </label>

        <motion.button
          type="submit"
          disabled={uploading}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full py-4 disabled:opacity-50"
        >
          {uploading ? 'アップロード中...' : 'アップロード'}
        </motion.button>
      </form>
    </div>
  );
}
