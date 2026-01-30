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
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold text-zinc-100">写真を投稿</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">画像ファイル</span>
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            disabled={uploading}
            className="block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500/20 file:px-4 file:py-2 file:text-amber-400 file:transition hover:file:bg-amber-500/30"
          />
        </label>
        <button
          type="submit"
          disabled={uploading}
          className="rounded-xl bg-amber-500/90 px-6 py-3 font-medium text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {uploading ? 'アップロード中...' : 'アップロード'}
        </button>
      </form>
      <p className="mt-6 text-sm text-zinc-500">
        投稿には SWEY_ANONYMOUS_OWNER_ID（profiles.id）の設定が必要です。
      </p>
    </div>
  );
}
