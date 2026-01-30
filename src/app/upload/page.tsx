'use client';

import { useState } from 'react';
import { uploadPhoto } from '@/lib/actions';
import { toast } from 'sonner';

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
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
    <div className="mx-auto max-w-md bg-black px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-zinc-100">写真を投稿</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">画像ファイル</span>
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            disabled={uploading}
            className="block w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 file:mr-4 file:rounded-lg file:border-0 file:bg-[#8B1538]/50 file:px-4 file:py-2 file:text-[#E63946]"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500">部位</span>
            <input type="text" name="part" className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" placeholder="例: 目" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500">作品名</span>
            <input type="text" name="title" className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" placeholder="例: 〇〇の〇" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500">キャラ名</span>
            <input type="text" name="character" className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" placeholder="例: キャラ名" />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">公開範囲</span>
          <select
            name="access_type"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100"
          >
            <option value="free">誰でも</option>
            <option value="follower">フォロワーのみ</option>
            <option value="paid">サブスクのみ</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_nsfw" value="true" className="rounded border-zinc-700 bg-zinc-900 text-[#8B1538]" />
          <span className="text-sm text-zinc-400">NSFW（センシティブ）</span>
        </label>

        <button
          type="submit"
          disabled={uploading}
          className="rounded-xl bg-[#8B1538] px-6 py-3 font-medium text-white transition hover:bg-[#E63946] disabled:opacity-50"
        >
          {uploading ? 'アップロード中...' : 'アップロード'}
        </button>
      </form>
      <p className="mt-6 text-xs text-zinc-500">
        投稿には Vercel の SWEY_ANONYMOUS_OWNER_ID（profiles.id）の設定が必要です。
      </p>
    </div>
  );
}
