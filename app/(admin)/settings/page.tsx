'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { removeToken } from '@/lib/auth';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import type { AppConfig } from '@/types/config';
import { Edit2, LogOut, Save, X } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ commissionRate: '', maxOwedCommission: '', maxDispatchRadius: '', geohashPrecision: '', paybillNumber: '', supportPhone: '', supportEmail: '' });

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/config');
      const cfg = data.config || data;
      setConfig(cfg);
      setForm({
        commissionRate: String((cfg.commissionRate * 100).toFixed(0)),
        maxOwedCommission: String(cfg.maxOwedCommission),
        maxDispatchRadius: cfg.maxDispatchRadius ? String(cfg.maxDispatchRadius) : '',
        geohashPrecision: cfg.geohashPrecision ? String(cfg.geohashPrecision) : '5',
        paybillNumber: cfg.paybillNumber || '',
        supportPhone: cfg.supportPhone || '',
        supportEmail: cfg.supportEmail || '',
      });
    } catch { showToast('error', 'Failed to load configuration'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchConfig(); }, []);

  const doSave = async () => {
    const rate = parseFloat(form.commissionRate);
    if (!form.commissionRate || isNaN(rate) || rate < 0 || rate > 20) return showToast('error', 'Commission rate must be 0–20%');
    setSaving(true);
    try {
      await api.put('/admin/config', {
        commissionRate: rate / 100,
        maxOwedCommission: parseFloat(form.maxOwedCommission),
        maxDispatchRadius: form.maxDispatchRadius ? parseFloat(form.maxDispatchRadius) : null,
        geohashPrecision: form.geohashPrecision ? parseInt(form.geohashPrecision, 10) : 5,
        paybillNumber: form.paybillNumber,
        supportPhone: form.supportPhone,
        supportEmail: form.supportEmail,
      });
      showToast('success', 'Configuration updated');
      setEditing(false); fetchConfig();
    } catch { showToast('error', 'Failed to save configuration'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { removeToken(); router.push('/login'); };
  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <LoadingSpinner fullScreen message="Loading settings…" />;

  const fields = [
    { key: 'commissionRate', label: 'Commission Rate (%)', hint: '0–20', type: 'number', display: config ? `${(config.commissionRate * 100).toFixed(0)}%` : '—' },
    { key: 'maxOwedCommission', label: 'Max Owed Commission (KES)', hint: 'Drivers blocked above this amount', type: 'number', display: `KES ${config?.maxOwedCommission?.toLocaleString()}` },
    { key: 'maxDispatchRadius', label: 'Max Dispatch Radius (km)', hint: 'Leave empty for no limit', type: 'number', display: config?.maxDispatchRadius ? `${config.maxDispatchRadius} km` : 'No Limit' },
    { key: 'geohashPrecision', label: 'Geohash Precision', hint: 'Used for geospatial queries (4-8). Lower = wider search area.', type: 'number', display: config?.geohashPrecision ? `${config.geohashPrecision}` : '5' },
    { key: 'paybillNumber', label: 'Paybill Number', type: 'text', display: config?.paybillNumber || 'Not set' },
    { key: 'supportPhone', label: 'Support Phone', type: 'tel', display: config?.supportPhone || 'Not set' },
    { key: 'supportEmail', label: 'Support Email', type: 'email', display: config?.supportEmail || 'Not set' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" subtitle="System configuration and admin profile" />

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">A</div>
        <div>
          <p className="font-bold text-textPrimary">Administrator</p>
          <p className="text-sm text-textSecondary">Role: Admin</p>
        </div>
      </div>

      {/* Config Card */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-textPrimary">System Configuration</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          ) : (
            <button onClick={() => { setEditing(false); }} className="flex items-center gap-1.5 text-sm text-textMuted hover:text-textPrimary">
              <X className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>

        <div className="divide-y divide-border">
          {fields.map(({ key, label, hint, type, display }) => (
            <div key={key} className="py-4">
              <label className="block text-xs font-semibold text-textMuted mb-1">{label}</label>
              {hint && <p className="text-xs text-textMuted italic mb-1.5">{hint}</p>}
              {editing ? (
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => f(key, e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                />
              ) : (
                <p className="text-sm font-semibold text-textPrimary">{display}</p>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-border">
            <button onClick={() => setEditing(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-textSecondary hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={doSave} disabled={saving} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-dark disabled:opacity-60 transition-colors">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full py-3 bg-error/5 border border-error/30 text-error font-bold rounded-2xl hover:bg-error hover:text-white transition-all flex items-center justify-center gap-2">
        <LogOut className="w-5 h-5" /> Log Out
      </button>
      <p className="text-center text-xs text-textMuted">Fikishwa Admin v1.0.0</p>
    </div>
  );
}
