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
import type { Promotion } from '@/types/config';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

const EMPTY = { code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', maxUses: '', expiryDate: '' };

export default function PromotionsPage() {
  const { showToast } = useToast();
  const [promos, setPromos] = useState<Promotion[]>([]);
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
    try { const { data } = await api.get('/admin/promotions/all'); setPromos(data.promotions || data || []); }
    catch { setError('Failed to load promotions.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openModal = (p?: Promotion) => {
    setEditId(p?.promoId || null);
    setForm(p ? { code: p.code, discountType: p.discountType, discountValue: String(p.discountValue), minOrderValue: String(p.minOrderValue || ''), maxUses: String(p.maxUses || ''), expiryDate: p.expiryDate || '' } : EMPTY);
    setModal(true);
  };

  const doSave = async () => {
    if (!form.code || !form.discountValue) return showToast('error', 'Please fill all required fields');
    setSaving(true);
    const payload = { code: form.code.toUpperCase(), discountType: form.discountType, discountValue: +form.discountValue, minOrderValue: form.minOrderValue ? +form.minOrderValue : undefined, maxUses: form.maxUses ? +form.maxUses : undefined, expiryDate: form.expiryDate || undefined };
    try {
      await api.post('/admin/promotions/create', payload);
      showToast('success', `Promotion ${editId ? 'updated' : 'created'}`); setModal(false); fetch();
    } catch { showToast('error', 'Failed to save promotion'); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/admin/promotions/${deleteId}`); showToast('success', 'Promotion deleted'); setDeleteId(null); fetch(); }
    catch { showToast('error', 'Failed to delete promotion'); }
    finally { setDeleting(false); }
  };

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Promotions"
        subtitle="Manage promo codes and discounts"
        actions={
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">
            <Plus className="w-4 h-4" /> New Promo
          </button>
        }
      />

      {loading ? <LoadingSpinner fullScreen message="Loading promotions…" /> :
        error ? <ErrorState message={error} onRetry={fetch} /> :
          promos.length === 0 ? <EmptyState icon="🎁" message="No promotions yet" action="Create Promo" onAction={() => openModal()} /> : (
            <div className="grid gap-3">
              {promos.map(p => (
                <div key={p.promoId} className="bg-white rounded-2xl border border-border shadow-sm p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-primary text-lg">{p.code}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `KES ${p.discountValue} OFF`}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-textMuted mt-1">
                      {p.maxUses && <span>Uses: {p.usedCount ?? 0}/{p.maxUses}</span>}
                      {p.expiryDate && <span>Expires: {formatDate(p.expiryDate)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openModal(p)} className="p-2 border border-border rounded-lg hover:bg-slate-50 transition-colors"><Edit2 className="w-4 h-4 text-textSecondary" /></button>
                    <button onClick={() => setDeleteId(p.code)} className="p-2 border border-error/30 rounded-lg hover:bg-error/5 transition-colors"><Trash2 className="w-4 h-4 text-error" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Promotion' : 'New Promotion'}>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-textSecondary mb-1">Promo Code *</label>
            <input value={form.code} onChange={e => f('code', e.target.value.toUpperCase())} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="SAVE20" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-textSecondary mb-1">Discount Type</label>
              <select value={form.discountType} onChange={e => f('discountType', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="percentage">Percentage</option><option value="flat">Flat Amount</option>
              </select></div>
            <div><label className="block text-xs font-semibold text-textSecondary mb-1">Discount Value *</label>
              <input type="number" value={form.discountValue} onChange={e => f('discountValue', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="20" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-textSecondary mb-1">Min Order (KES)</label>
              <input type="number" value={form.minOrderValue} onChange={e => f('minOrderValue', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div><label className="block text-xs font-semibold text-textSecondary mb-1">Max Uses</label>
              <input type="number" value={form.maxUses} onChange={e => f('maxUses', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          </div>
          <div><label className="block text-xs font-semibold text-textSecondary mb-1">Expiry Date</label>
            <input type="date" value={form.expiryDate} onChange={e => f('expiryDate', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-textSecondary hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={doSave} disabled={saving} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark disabled:opacity-60">{saving ? 'Saving…' : 'Save Promo'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="Delete Promotion" message="This promo code will be permanently deleted." confirmLabel="Delete" confirmVariant="danger" onConfirm={doDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}
