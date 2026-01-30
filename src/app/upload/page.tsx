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
    <div className="mx-auto max-w-md bg-pop-cream px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-pop-text drop-shadow-sm">写真を投稿</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-pop-text">画像ファイル</span>
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            disabled={uploading}
            className="block w-full rounded-2xl border-2 border-pop-lavender bg-white px-4 py-3 text-pop-text file:mr-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-[#FF6B9D] file:to-[#FF9F43] file:px-4 file:py-2 file:font-medium file:text-white file:transition hover:file:opacity-90"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-pop-text/80">部位</span>
            <input
              type="text"
              name="part"
              className="w-full rounded-xl border-2 border-pop-lavender bg-white px-3 py-2 text-sm text-pop-text"
              placeholder="例: 目"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-pop-text/80">作品名</span>
            <input
              type="text"
              name="title"
              className="w-full rounded-xl border-2 border-pop-lavender bg-white px-3 py-2 text-sm text-pop-text"
              placeholder="例: 〇〇の〇"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-pop-text/80">キャラ名</span>
            <input
              type="text"
              name="character"
              className="w-full rounded-xl border-2 border-pop-lavender bg-white px-3 py-2 text-sm text-pop-text"
              placeholder="例: キャラ名"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-pop-text">公開範囲</span>
          <select
            name="access_type"
            className="w-full rounded-2xl border-2 border-pop-lavender bg-white px-4 py-3 text-pop-text"
          >
            <option value="free">誰でも</option>
            <option value="follower">フォロワーのみ</option>
            <option value="paid">サブスクのみ</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_nsfw"
            value="true"
            className="h-4 w-4 rounded border-2 border-pop-lavender text-[#FF6B9D]"
          />
          <span className="text-sm text-pop-text">NSFW（センシティブ）</span>
        </label>

        <button
          type="submit"
          disabled={uploading}
          className="rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF9F43] px-6 py-4 font-bold text-white shadow-pop transition active:scale-[0.98] disabled:opacity-50"
        >
          {uploading ? 'アップロード中...' : 'アップロード'}
        </button>
      </form>
      <p className="mt-6 text-xs text-pop-text/70">
        投稿には Vercel の SWEY_ANONYMOUS_OWNER_ID（profiles.id）の設定が必要です。
      </p>
    </div>
  );
}
