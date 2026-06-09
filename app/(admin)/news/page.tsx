'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/auth';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState, { ErrorState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit2, Trash2, Newspaper } from 'lucide-react';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  status: 'published' | 'draft';
  targetAudience: 'all' | 'customer' | 'driver';
  createdAt?: any;
}

const EMPTY: Omit<NewsItem, 'id'> = { title: '', content: '', status: 'draft', targetAudience: 'all' };

export default function NewsPage() {
  const { showToast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const fetch = useCallback(async () => {
    setLoading(true); setError('');
    try { const { data } = await api.get('/admin/news'); setNews(data.news || []); }
    catch { setError('Failed to load news.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openModal = (item?: NewsItem) => {
    setEditId(item?.id || null);
    setForm(item ? { title: item.title, content: item.content, status: item.status, targetAudience: item.targetAudience } : EMPTY);
    setModal(true);
  };

  const doSave = async () => {
    if (!form.title || !form.content) return showToast('error', 'Please fill all required fields');
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/admin/news/${editId}`, form);
      } else {
        await api.post('/admin/news', form);
      }
      showToast('success', `News ${editId ? 'updated' : 'created'}`); setModal(false); fetch();
    } catch { showToast('error', 'Failed to save news'); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/admin/news/${deleteId}`); showToast('success', 'News deleted'); setDeleteId(null); fetch(); }
    catch { showToast('error', 'Failed to delete news'); }
    finally { setDeleting(false); }
  };

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="News & Updates"
        subtitle="Manage blog posts and system announcements"
        actions={
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">
            <Plus className="w-4 h-4" /> Create Post
          </button>
        }
      />

      {loading ? <LoadingSpinner fullScreen message="Loading news…" /> :
        error ? <ErrorState message={error} onRetry={fetch} /> :
          news.length === 0 ? <EmptyState icon="📰" message="No news items yet" action="Create Post" onAction={() => openModal()} /> : (
            <div className="grid gap-3">
              {news.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-border shadow-sm p-5 flex gap-4">
                  <div className="w-12 h-12 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                    <Newspaper className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="font-bold text-textPrimary text-lg">{item.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.status === 'published' ? 'bg-success/10 text-success' : 'bg-slate-100 text-textSecondary'}`}>
                        {item.status.toUpperCase()}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                        {item.targetAudience.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-textSecondary line-clamp-2">{item.content}</p>
                    <div className="flex gap-4 text-xs text-textMuted mt-3">
                      {item.createdAt && <span>Created: {item.createdAt?.seconds ? formatDate(new Date(item.createdAt.seconds * 1000).toISOString()) : 'Recent'}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => openModal(item)} className="p-2 border border-border rounded-lg hover:bg-slate-50 transition-colors"><Edit2 className="w-4 h-4 text-textSecondary" /></button>
                    <button onClick={() => setDeleteId(item.id)} className="p-2 border border-error/30 rounded-lg hover:bg-error/5 transition-colors"><Trash2 className="w-4 h-4 text-error" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Post' : 'New Post'}>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-textSecondary mb-1">Title *</label>
            <input value={form.title} onChange={e => f('title', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Post Title" /></div>
          
          <div><label className="block text-xs font-semibold text-textSecondary mb-1">Content *</label>
            <textarea rows={5} value={form.content} onChange={e => f('content', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Write your post content here..." /></div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-textSecondary mb-1">Status</label>
              <select value={form.status} onChange={e => f('status', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="draft">Draft</option><option value="published">Published</option>
              </select></div>
            <div><label className="block text-xs font-semibold text-textSecondary mb-1">Target Audience</label>
              <select value={form.targetAudience} onChange={e => f('targetAudience', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="all">All</option><option value="customer">Customers</option><option value="driver">Drivers</option>
              </select></div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-textSecondary hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={doSave} disabled={saving} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark disabled:opacity-60">{saving ? 'Saving…' : 'Save Post'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="Delete Post" message="This post will be permanently deleted." confirmLabel="Delete" confirmVariant="danger" onConfirm={doDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}
