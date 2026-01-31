'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getProfile } from '@/lib/queries';
import { getAdminStats, getUsersForAdmin, getPhotosForAdmin, getReportsForAdmin } from '@/lib/queries';
import { adminBanUser, adminUnbanUser, adminHidePhoto, adminResolveReport } from '@/lib/actions';
import { toast } from 'sonner';
import { ChartBar, Users, ImageIcon, Flag, Shield } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const { userId: authUserId } = useAuth();
  const ADMIN_ID = authUserId || process.env.NEXT_PUBLIC_ANONYMOUS_OWNER_ID || '';
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [stats, setStats] = useState<{ totalRevenueCents: number; activeUsers: number; photoCount: number } | null>(null);
  const [users, setUsers] = useState<{ id: string; display_name: string | null; is_banned: boolean }[]>([]);
  const [photos, setPhotos] = useState<{ id: string; owner_id: string; image_url: string; status: string; access_type: string; is_nsfw: boolean; created_at: string }[]>([]);
  const [reports, setReports] = useState<{ id: string; reporter_id: string; photo_id: string; reason: string | null; status: string; created_at: string }[]>([]);
  const [tab, setTab] = useState<'stats' | 'users' | 'content' | 'reports'>('stats');

  useEffect(() => {
    if (!ADMIN_ID) {
      setAllowed(false);
      return;
    }
    getProfile(ADMIN_ID).then((p) => {
      setAllowed((p as { is_admin?: boolean } | null)?.is_admin === true);
    });
  }, [ADMIN_ID]);

  useEffect(() => {
    if (!allowed) return;
    getAdminStats().then(setStats);
    getUsersForAdmin().then(setUsers);
    getPhotosForAdmin().then(setPhotos);
    getReportsForAdmin().then(setReports);
  }, [allowed]);

  async function handleBan(id: string) {
    const r = await adminBanUser(ADMIN_ID, id);
    if (r.ok) {
      toast.success('ユーザーを凍結しました');
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_banned: true } : u)));
    } else toast.error(r.error);
  }

  async function handleUnban(id: string) {
    const r = await adminUnbanUser(ADMIN_ID, id);
    if (r.ok) {
      toast.success('凍結を解除しました');
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_banned: false } : u)));
    } else toast.error(r.error);
  }

  async function handleHidePhoto(photoId: string) {
    const r = await adminHidePhoto(ADMIN_ID, photoId);
    if (r.ok) {
      toast.success('投稿を非表示にしました');
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } else toast.error(r.error);
  }

  async function handleResolve(reportId: string, action: 'resolved' | 'dismissed') {
    const r = await adminResolveReport(ADMIN_ID, reportId, action);
    if (r.ok) {
      toast.success(action === 'resolved' ? '対応済みにしました' : '却下しました');
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: action } : r)));
    } else toast.error(r.error);
  }

  if (allowed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">確認中...</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-slate-600">このページにアクセスする権限がありません。</p>
        <Link href="/" className="btn-primary mt-4 inline-block px-6 py-3">
          ホームへ
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'stats' as const, label: '統計', Icon: ChartBar },
    { id: 'users' as const, label: 'ユーザー', Icon: Users },
    { id: 'content' as const, label: 'コンテンツ', Icon: ImageIcon },
    { id: 'reports' as const, label: '通報', Icon: Flag },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Shield size={28} weight="regular" className="text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-900">管理者ダッシュボード</h1>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
              tab === id
                ? 'border-indigo-300 bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-md'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon size={18} weight="regular" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <div className="modern-card p-6">
            <p className="text-sm font-medium text-slate-500">総売上（購入）</p>
            <p className="text-2xl font-bold text-indigo-600">¥{(stats.totalRevenueCents / 100).toLocaleString()}</p>
          </div>
          <div className="modern-card p-6">
            <p className="text-sm font-medium text-slate-500">アクティブユーザー</p>
            <p className="text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
          </div>
          <div className="modern-card p-6">
            <p className="text-sm font-medium text-slate-500">投稿数</p>
            <p className="text-2xl font-bold text-slate-900">{stats.photoCount}</p>
          </div>
        </motion.div>
      )}

      {tab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          {users.length === 0 ? (
            <p className="text-slate-500">ユーザーがいません。</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="modern-card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-slate-900">{u.display_name || u.id.slice(0, 8)}</p>
                  <p className="text-xs text-slate-500">{u.id}</p>
                </div>
                <div className="flex gap-2">
                  {u.is_banned ? (
                    <button
                      type="button"
                      onClick={() => handleUnban(u.id)}
                      className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
                    >
                      凍結解除
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBan(u.id)}
                      className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
                    >
                      凍結
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {tab === 'content' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {photos.length === 0 ? (
            <p className="text-slate-500">投稿がありません。</p>
          ) : (
            photos.map((p) => (
              <div key={p.id} className="modern-card flex items-center gap-4 p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={p.image_url} alt="" fill className="object-cover" unoptimized sizes="80px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">{p.id}</p>
                  <p className="text-sm text-slate-700">
                    owner: {p.owner_id.slice(0, 8)}… / {p.access_type} / {p.is_nsfw ? 'NSFW' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleHidePhoto(p.id)}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
                >
                  非表示
                </button>
              </div>
            ))
          )}
        </motion.div>
      )}

      {tab === 'reports' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-slate-500">通報はありません。</p>
          ) : (
            reports
              .filter((r) => r.status === 'pending')
              .map((r) => (
                <div key={r.id} className="modern-card p-4">
                  <p className="text-sm text-slate-700">
                    写真ID: {r.photo_id.slice(0, 8)}… / 理由: {r.reason || '-'}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleResolve(r.id, 'resolved')}
                      className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
                    >
                      対応済み
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolve(r.id, 'dismissed')}
                      className="btn-secondary px-3 py-1.5 text-sm"
                    >
                      却下
                    </button>
                  </div>
                </div>
              ))
          )}
          {reports.filter((r) => r.status !== 'pending').length > 0 && (
            <p className="text-slate-500">対応済み・却下: {reports.filter((r) => r.status !== 'pending').length}件</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
