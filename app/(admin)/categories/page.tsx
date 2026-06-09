'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/auth';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState, { ErrorState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import type { VehicleCategory } from '@/types/category';
import { Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

const EMPTY_FORM = { name: '', baseFare: '', perKmRate: '', perMinRate: '', minFare: '', maxPassengers: '4', image: '' };

export default function CategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetch = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/admin/vehicle-categories');
      setCategories(data.categories || []);
    } catch { setError('Failed to load categories.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openModal = (cat?: VehicleCategory) => {
    setEditId(cat?.categoryId || null);
    setForm(cat ? { name: cat.name, baseFare: String(cat.baseFare), perKmRate: String(cat.perKmRate), perMinRate: String(cat.perMinRate), minFare: String(cat.minFare), maxPassengers: String(cat.maxPassengers), image: cat.image || '' } : EMPTY_FORM);
    setModal(true);
  };

  const doToggle = async (cat: VehicleCategory) => {
    setCategories(p => p.map(c => c.categoryId === cat.categoryId ? { ...c, active: !c.active } : c));
    try { await api.post(`/admin/vehicle-categories/${cat.categoryId}/toggle`, { active: !cat.active }); }
    catch { setCategories(p => p.map(c => c.categoryId === cat.categoryId ? { ...c, active: cat.active } : c)); showToast('error', 'Failed to update status'); }
  };

  const doSave = async () => {
    if (!form.name || !form.baseFare || !form.perKmRate || !form.minFare) return showToast('error', 'Please fill all required fields');
    setSaving(true);
    const payload = { name: form.name, baseFare: +form.baseFare, perKmRate: +form.perKmRate, perMinRate: +form.perMinRate || 0, minFare: +form.minFare, maxPassengers: +form.maxPassengers || 4, image: form.image };
    try {
      if (editId) await api.post(`/admin/vehicle-categories/${editId}/update`, payload);
      else await api.post('/admin/vehicle-categories/create', { ...payload, categoryId: form.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''), active: true });
      showToast('success', `Category ${editId ? 'updated' : 'created'}`);
      setModal(false); fetch();
    } catch { showToast('error', 'Failed to save category'); }
    finally { setSaving(false); }
  };

  const f = (k: keyof typeof EMPTY_FORM, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Vehicle Categories"
        subtitle="Manage ride types and pricing"
        actions={
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">
            <Plus className="w-4 h-4" /> New Category
          </button>
        }
      />

      {loading ? <LoadingSpinner fullScreen message="Loading categories…" /> :
        error ? <ErrorState message={error} onRetry={fetch} /> :
          categories.length === 0 ? <EmptyState icon="🚗" message="No categories yet" action="Add Category" onAction={() => openModal()} /> : (
            <div className="grid md:grid-cols-2 gap-4">
              {categories.map(cat => (
                <div key={cat.categoryId} className="bg-white rounded-2xl border border-border shadow-sm p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-textPrimary text-lg">{cat.name}</h3>
                      <p className="text-xs text-textMuted">Max {cat.maxPassengers} passengers</p>
                    </div>
                    <button onClick={() => doToggle(cat)} className="transition-colors">
                      {cat.active
                        ? <ToggleRight className="w-8 h-8 text-success" />
                        : <ToggleLeft className="w-8 h-8 text-textMuted" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Base Fare', val: formatCurrency(cat.baseFare) },
                      { label: 'Min Fare', val: formatCurrency(cat.minFare) },
                      { label: 'Per KM', val: formatCurrency(cat.perKmRate) },
                      { label: 'Per Min', val: formatCurrency(cat.perMinRate) },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-textMuted">{label}</p>
                        <p className="font-bold text-sm text-textPrimary">{val}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => openModal(cat)} className="w-full py-2 border border-border rounded-xl text-sm font-semibold text-textSecondary hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </div>
              ))}
            </div>
          )}

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Category' : 'New Vehicle Category'}>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-textSecondary mb-1">Category Name *</label>
            <input value={form.name} onChange={e => f('name', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Economy" /></div>

          <p className="text-xs font-bold uppercase tracking-wider text-primary pt-1">Pricing (KES)</p>
          <div className="grid grid-cols-2 gap-3">
            {[['baseFare', 'Base Fare *'], ['minFare', 'Min Fare *'], ['perKmRate', 'Per KM *'], ['perMinRate', 'Per Min']].map(([key, label]) => (
              <div key={key}><label className="block text-xs font-semibold text-textSecondary mb-1">{label}</label>
                <input type="number" value={form[key as keyof typeof EMPTY_FORM]} onChange={e => f(key as keyof typeof EMPTY_FORM, e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="0" /></div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-textSecondary mb-1">Max Passengers</label>
              <input type="number" value={form.maxPassengers} onChange={e => f('maxPassengers', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          </div>

          <div><label className="block text-xs font-semibold text-textSecondary mb-1">Image URL (optional)</label>
            <input value={form.image} onChange={e => f('image', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="https://…" /></div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-textSecondary hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={doSave} disabled={saving} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-60">{saving ? 'Saving…' : 'Save Category'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
