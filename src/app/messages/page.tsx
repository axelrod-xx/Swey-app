'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMessagePartners, getMessages } from '@/lib/queries';
import { sendMessage } from '@/lib/actions';
import { toast } from 'sonner';
import type { Profile } from '@/lib/types';

type MessageRow = { id: string; sender_id: string; receiver_id: string; content: string; is_read: boolean; created_at: string };

const ANON_ID = process.env.NEXT_PUBLIC_ANONYMOUS_OWNER_ID || '';

export default function MessagesPage() {
  const [partners, setPartners] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ANON_ID) {
      setLoading(false);
      return;
    }
    getMessagePartners(ANON_ID).then(setPartners).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!ANON_ID || !selectedId) {
      setMessages([]);
      return;
    }
    getMessages(ANON_ID, selectedId).then(setMessages);
  }, [selectedId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!ANON_ID || !selectedId || !content.trim()) return;
    const result = await sendMessage(ANON_ID, selectedId, content.trim());
    if (result.ok) {
      setContent('');
      getMessages(ANON_ID, selectedId).then(setMessages);
    } else {
      toast.error(result.error || '送信に失敗しました');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-zinc-500">読み込み中...</p>
      </div>
    );
  }

  if (!ANON_ID) {
    return (
      <div className="mx-auto max-w-lg bg-black px-4 py-12 text-center">
        <p className="text-zinc-500">DM 利用には NEXT_PUBLIC_ANONYMOUS_OWNER_ID（現在のユーザーID）の設定が必要です。</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col bg-black sm:flex-row sm:h-[calc(100vh-4rem)]">
      <aside className="w-full border-b border-zinc-900 sm:w-64 sm:border-b-0 sm:border-r">
        <h1 className="border-b border-zinc-900 p-4 text-lg font-semibold text-zinc-100">DM</h1>
        {partners.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500">メッセージのやり取りがあるユーザーがいません。</p>
        ) : (
          <ul>
            {partners.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full px-4 py-3 text-left text-sm transition ${
                    selectedId === p.id ? 'bg-[#8B1538]/30 text-[#E63946]' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  {p.display_name || p.id.slice(0, 8)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <div className="flex flex-1 flex-col">
        {selectedId ? (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender_id === ANON_ID ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      m.sender_id === ANON_ID ? 'bg-[#8B1538]/50 text-white' : 'bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex gap-2 border-t border-zinc-900 p-4">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="メッセージ..."
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder:text-zinc-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#8B1538] px-4 py-2 text-sm font-medium text-white hover:bg-[#E63946]"
              >
                送信
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-zinc-500">
            ユーザーを選択してください
          </div>
        )}
      </div>
    </div>
  );
}
