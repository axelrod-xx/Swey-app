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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pop-cream to-pop-lavender">
        <p className="text-pop-text">読み込み中...</p>
      </div>
    );
  }

  if (!ANON_ID) {
    return (
      <div className="mx-auto max-w-lg bg-pop-cream px-4 py-12 text-center">
        <p className="text-pop-text/80">DM 利用には NEXT_PUBLIC_ANONYMOUS_OWNER_ID（現在のユーザーID）の設定が必要です。</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col bg-pop-cream sm:flex-row sm:h-[calc(100vh-4rem)]">
      <aside className="w-full border-b-2 border-pop-lavender bg-white/80 sm:w-64 sm:border-b-0 sm:border-r-2 sm:border-pop-lavender">
        <h1 className="border-b-2 border-pop-lavender p-4 text-lg font-bold text-pop-text">DM</h1>
        {partners.length === 0 ? (
          <p className="p-4 text-sm text-pop-text/70">メッセージのやり取りがあるユーザーがいません。</p>
        ) : (
          <ul>
            {partners.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition shadow-popCard active:scale-[0.98] ${
                    selectedId === p.id
                      ? 'bg-gradient-to-r from-[#FF85A2] to-[#FF6B9D] text-white'
                      : 'text-pop-text hover:bg-pop-lavender/50'
                  }`}
                >
                  {p.display_name || p.id.slice(0, 8)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <div className="flex flex-1 flex-col bg-pop-cream">
        {selectedId ? (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender_id === ANON_ID ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-popCard ${
                      m.sender_id === ANON_ID
                        ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF9F43] text-white'
                        : 'bg-white border-2 border-pop-lavender text-pop-text'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex gap-2 border-t-2 border-pop-lavender bg-white/80 p-4">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="メッセージ..."
                className="flex-1 rounded-2xl border-2 border-pop-lavender bg-pop-cream px-4 py-2.5 text-pop-text placeholder:text-pop-text/50"
              />
              <button
                type="submit"
                className="pop-btn rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF9F43] px-4 py-2.5 text-sm font-bold text-white shadow-pop"
              >
                送信
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-pop-text/70">
            ユーザーを選択してください
          </div>
        )}
      </div>
    </div>
  );
}
