'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/auth';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import type { Driver } from '@/types/driver';
import type { VehicleCategory } from '@/types/category';
import { ArrowLeft, CheckCircle, XCircle, Power, Eye, AlertCircle } from 'lucide-react';

const DOCS = [
  { key: 'ID Front', urlKey: 'idFrontUrl' },
  { key: 'ID Back', urlKey: 'idBackUrl' },
  { key: 'Driving License', urlKey: 'licenseUrl' },
  { key: 'Good Conduct', urlKey: 'goodConductUrl' },
  { key: 'Car Photo', urlKey: 'carImageUrl' },
  { key: 'Logbook', urlKey: 'carRegistrationUrl' },
] as const;

export default function DriverDetailPage() {
  const { driverId } = useParams<{ driverId: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);

  // Modals
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [categoryModal, setCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [phoneModal, setPhoneModal] = useState(false);
  const [phoneVal, setPhoneVal] = useState('');
  const [imageModal, setImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageLabel, setImageLabel] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const fetchDriver = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/drivers/${driverId}`);
      setDriver(data.driver || data);
    } catch { showToast('error', 'Failed to load driver details'); router.back(); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchDriver();
    api.get('/admin/vehicle-categories').then(({ data }) => setCategories(data.categories || []));
  }, [driverId]);

  const doApprove = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/drivers/${driverId}/approve`);
      showToast('success', 'Driver approved successfully'); setConfirmApprove(false); fetchDriver();
    } catch { showToast('error', 'Failed to approve driver'); }
    finally { setActionLoading(false); }
  };

  const doReject = async () => {
    if (!rejectReason.trim()) return showToast('error', 'Please provide a rejection reason');
    setActionLoading(true);
    try {
      await api.post(`/admin/drivers/${driverId}/reject`, { reason: rejectReason });
      showToast('success', 'Driver rejected'); setRejectModal(false); fetchDriver();
    } catch { showToast('error', 'Failed to reject driver'); }
    finally { setActionLoading(false); }
  };

  const doToggle = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/auth/toggle-driver-status`, { uid: driver?.uid, isEnabled: driver?.isEnabled === false });
      showToast('success', `Driver ${driver?.isEnabled === false ? 'enabled' : 'disabled'}`);
      setConfirmToggle(false); fetchDriver();
    } catch { showToast('error', 'Failed to toggle driver'); }
    finally { setActionLoading(false); }
  };

  const doUpdateCategory = async () => {
    if (!selectedCategory) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/drivers/${driverId}/update-category`, { categoryId: selectedCategory });
      showToast('success', 'Category updated'); setCategoryModal(false); fetchDriver();
    } catch { showToast('error', 'Failed to update category'); }
    finally { setActionLoading(false); }
  };

  const doUpdatePhone = async () => {
    if (!phoneVal.trim()) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/drivers/${driverId}/update-phone`, { phone: phoneVal });
      showToast('success', 'Phone updated'); setPhoneModal(false); fetchDriver();
    } catch { showToast('error', 'Failed to update phone'); }
    finally { setActionLoading(false); }
  };

  const doVerifyDoc = async (action: 'verify' | 'flag') => {
    setActionLoading(true);
    try {
      await api.post(`/admin/drivers/${driverId}/verify-document`, {
        docKey: imageLabel, docLabel: imageLabel,
        status: action === 'verify' ? 'approved' : 'rejected',
        reason: action === 'flag' ? `Issue with ${imageLabel}` : undefined,
      });
      showToast('success', `${imageLabel} ${action === 'verify' ? 'verified' : 'flagged'}`);
      setImageModal(false); fetchDriver();
    } catch { showToast('error', 'Failed to update document'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading driver…" />;
  if (!driver) return null;

  const isApproved = driver.registrationStatus === 'approved';
  const statusVariant = driver.registrationStatus === 'approved' ? 'success' : driver.registrationStatus === 'rejected' ? 'error' : 'warning';

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-textSecondary hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Drivers
      </button>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
          {driver.profilePhotoUrl
            ? <img src={driver.profilePhotoUrl} alt={driver.name} className="w-full h-full object-cover" />
            : <span className="text-3xl font-bold text-primary">{driver.name?.[0]?.toUpperCase()}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-xl font-bold text-textPrimary">{driver.name}</h1>
            <Badge label={driver.registrationStatus?.toUpperCase()} variant={statusVariant} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-textSecondary">{driver.phone}</span>
            <button onClick={() => { setPhoneVal(driver.phone); setPhoneModal(true); }} className="text-xs text-primary hover:underline">Edit</button>
          </div>
        </div>
      </div>

      {/* Financial */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-error/5 border border-error/20 rounded-xl p-4">
          <p className="text-xs text-textMuted mb-1">Owed Commission</p>
          <p className="text-lg font-bold text-error">{formatCurrency(driver.owedCommission ?? 0)}</p>
        </div>
        <div className="bg-success/5 border border-success/20 rounded-xl p-4">
          <p className="text-xs text-textMuted mb-1">Pending Payout</p>
          <p className="text-lg font-bold text-success">{formatCurrency(driver.pendingPayout ?? 0)}</p>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">Vehicle Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Model', `${driver.carModel || '—'} ${driver.carYear ? `(${driver.carYear})` : ''}`],
            ['Plate', driver.plateNumber || driver.vehicleRegNo || '—'],
            ['Type', driver.vehicleType || '—'],
          ].map(([label, val]) => (
            <div key={label}><p className="text-textMuted">{label}</p><p className="font-semibold text-textPrimary">{val}</p></div>
          ))}
          <div>
            <p className="text-textMuted">Category</p>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-textPrimary">{driver.vehicleType || '—'}</span>
              <button onClick={() => setCategoryModal(true)} className="text-xs text-primary hover:underline">Edit</button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">Compliance Documents</h2>
        <div className="space-y-2">
          {DOCS.map(({ key, urlKey }) => {
            const url = driver[urlKey as keyof Driver] as string | undefined;
            const status = driver.docStatuses?.[key];
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  {status?.status === 'approved' && <CheckCircle className="w-4 h-4 text-success shrink-0" />}
                  {status?.status === 'rejected' && <XCircle className="w-4 h-4 text-error shrink-0" />}
                  {!status?.status && <AlertCircle className="w-4 h-4 text-textMuted shrink-0" />}
                  <span className="text-sm font-medium text-textPrimary">{key}</span>
                  {status?.status && <Badge label={status.status.toUpperCase()} variant={status.status === 'approved' ? 'success' : status.status === 'rejected' ? 'error' : 'default'} />}
                </div>
                {url ? (
                  <button onClick={() => { setImageUrl(url); setImageLabel(key); setImageLoading(true); setImageModal(true); }} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                ) : <span className="text-xs text-textMuted">Missing</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setConfirmApprove(true)} className="flex-1 py-2.5 rounded-xl bg-success text-white text-sm font-bold hover:bg-green-700 transition-colors">
          ✓ Approve Driver
        </button>
        <button onClick={() => setRejectModal(true)} className="flex-1 py-2.5 rounded-xl bg-error text-white text-sm font-bold hover:bg-red-700 transition-colors">
          ✕ Reject Driver
        </button>
        {isApproved && (
          <button onClick={() => setConfirmToggle(true)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${driver.isEnabled === false ? 'bg-success hover:bg-green-700' : 'bg-slate-500 hover:bg-slate-600'}`}>
            <Power className="w-4 h-4" /> {driver.isEnabled === false ? 'Enable Driver' : 'Disable Driver'}
          </button>
        )}
      </div>

      {/* Modals */}
      <ConfirmDialog open={confirmApprove} title="Approve Driver" message="This driver will be able to start accepting rides." confirmLabel="Approve" onConfirm={doApprove} onCancel={() => setConfirmApprove(false)} loading={actionLoading} />
      <ConfirmDialog open={confirmToggle} title={driver.isEnabled === false ? 'Enable Driver' : 'Disable Driver'} message={`This will ${driver.isEnabled === false ? 'reactivate' : 'suspend'} the driver account.`} confirmLabel="Confirm" confirmVariant={driver.isEnabled === false ? 'primary' : 'danger'} onConfirm={doToggle} onCancel={() => setConfirmToggle(false)} loading={actionLoading} />

      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Reject Driver" size="sm">
        <p className="text-sm text-textSecondary mb-3">Please provide a reason for rejection.</p>
        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Enter rejection reason…" />
        <div className="flex gap-3 mt-4">
          <button onClick={() => setRejectModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-textSecondary hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={doReject} disabled={actionLoading} className="flex-1 py-2.5 bg-error rounded-xl text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-60">{actionLoading ? 'Rejecting…' : 'Reject'}</button>
        </div>
      </Modal>

      <Modal open={phoneModal} onClose={() => setPhoneModal(false)} title="Update Phone Number" size="sm">
        <input value={phoneVal} onChange={e => setPhoneVal(e.target.value)} type="tel" placeholder="+254…" className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <div className="flex gap-3 mt-4">
          <button onClick={() => setPhoneModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-textSecondary hover:bg-slate-50">Cancel</button>
          <button onClick={doUpdatePhone} disabled={actionLoading} className="flex-1 py-2.5 bg-primary rounded-xl text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60">{actionLoading ? 'Saving…' : 'Save'}</button>
        </div>
      </Modal>

      <Modal open={categoryModal} onClose={() => setCategoryModal(false)} title="Select Vehicle Category" size="sm">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map(c => (
            <button key={c.categoryId} onClick={() => setSelectedCategory(c.categoryId)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${selectedCategory === c.categoryId ? 'bg-primary text-white' : 'border border-border hover:bg-slate-50 text-textPrimary'}`}>
              {c.name}
              {selectedCategory === c.categoryId && <span className="float-right">✓</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setCategoryModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-textSecondary hover:bg-slate-50">Cancel</button>
          <button onClick={doUpdateCategory} disabled={!selectedCategory || actionLoading} className="flex-1 py-2.5 bg-primary rounded-xl text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60">{actionLoading ? 'Saving…' : 'Save'}</button>
        </div>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal open={imageModal} onClose={() => setImageModal(false)} title={imageLabel} size="lg">
        <div className="flex flex-col gap-4">
          <div className="relative bg-slate-100 rounded-xl overflow-hidden min-h-64 flex items-center justify-center">
            {imageLoading && <LoadingSpinner message="Loading image…" />}
            <img src={imageUrl} alt={imageLabel} className="max-w-full max-h-96 object-contain rounded-xl" onLoad={() => setImageLoading(false)} onError={() => setImageLoading(false)} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => doVerifyDoc('flag')} disabled={actionLoading} className="flex-1 py-2.5 bg-error/10 border border-error/30 text-error font-semibold text-sm rounded-xl hover:bg-error hover:text-white transition-colors disabled:opacity-60">
              ✕ Flag Issue
            </button>
            <button onClick={() => doVerifyDoc('verify')} disabled={actionLoading} className="flex-1 py-2.5 bg-success text-white font-semibold text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
              ✓ Verify
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
