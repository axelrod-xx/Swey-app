'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getMessagePartners, getMessages } from '@/lib/queries';
import { sendMessage } from '@/lib/actions';
import { toast } from 'sonner';
import type { Profile } from '@/lib/types';

type MessageRow = { id: string; sender_id: string; receiver_id: string; content: string; is_read: boolean; created_at: string };

export default function MessagesPage() {
  const { userId, openLoginModal } = useAuth();
  const [partners, setPartners] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    getMessagePartners(userId).then(setPartners).finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userId || !selectedId) {
      setMessages([]);
      return;
    }
    getMessages(userId, selectedId).then(setMessages);
  }, [userId, selectedId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !selectedId || !content.trim()) return;
    const result = await sendMessage(userId, selectedId, content.trim());
    if (result.ok) {
      setContent('');
      getMessages(userId, selectedId).then(setMessages);
    } else {
      toast.error(result.error || '送信に失敗しました');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-candy-cream">
        <p className="text-candy-text">読み込み中...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="candy-card max-w-sm p-8"
        >
          <p className="mb-2 text-xl font-bold text-candy-text">ログインしてメッセージを送ろう 💌</p>
          <p className="mb-6 text-sm text-candy-text/70">DM はログイン後に利用できます</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={openLoginModal}
            className="candy-btn jelly-pink w-full py-4 font-bold"
          >
            ログインする
          </motion.button>
          <Link href="/" className="mt-4 block text-sm font-medium text-candy-peach underline">
            トップへ戻る
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col bg-candy-cream sm:h-[calc(100vh-4rem)] sm:flex-row">
      <aside className="w-full border-b-[3px] border-candy-lavender/50 bg-white/90 sm:w-64 sm:border-b-0 sm:border-r-[3px] sm:border-candy-lavender/50">
        <h1 className="border-b-[3px] border-candy-lavender/50 p-4 text-lg font-bold text-candy-text">DM 💌</h1>
        {partners.length === 0 ? (
          <p className="p-4 text-sm text-candy-text/70">メッセージのやり取りがあるユーザーがいないよ。</p>
        ) : (
          <ul>
            {partners.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    selectedId === p.id
                      ? 'border-2 border-candy-peach bg-candy-peach/15 text-candy-peach'
                      : 'text-candy-text hover:bg-candy-lavender/20'
                  }`}
                >
                  {p.display_name || p.id.slice(0, 8)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <div className="flex flex-1 flex-col bg-candy-cream">
        {selectedId ? (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl border-2 px-4 py-2.5 text-sm ${
                      m.sender_id === userId
                        ? 'border-candy-peach/50 bg-candy-peach text-white'
                        : 'border-candy-lavender/50 bg-white text-candy-text'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex gap-2 border-t-[3px] border-candy-lavender/50 bg-white/80 p-4">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="メッセージ..."
                className="candy-input flex-1"
              />
              <motion.button type="submit" whileTap={{ scale: 0.97 }} className="candy-btn jelly-pink px-4 py-2.5 text-sm font-bold">
                送信
              </motion.button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-candy-text/70">
            ユーザーを選んでね
          </div>
        )}
      </div>
    </div>
  );
}
