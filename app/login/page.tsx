'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setToken } from '@/lib/auth';
import { Car, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = async () => {
    setError('');
    if (!identifier.trim()) return setError('Please enter your email or phone number.');
    
    let payload = {};
    if (identifier.includes('@')) {
      payload = { email: identifier.trim() };
    } else {
      const phoneStr = identifier.trim();
      const fullPhone = phoneStr.startsWith('+') ? phoneStr : `+254${phoneStr.replace(/^0/, '')}`;
      payload = { phone: fullPhone };
    }

    setLoading(true);
    try {
      const { data } = await api.post('/admin/auth/send-otp', payload);
      setSessionId(data.data.sessionId);
      setStep('otp');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; error?: string } } };
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Failed to send OTP. Check your details.');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every(d => d)) handleVerify(next.join(''));
  };

  const handleVerify = async (code: string) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/admin/auth/verify-otp', { sessionId, otp: code });
      setToken(data.data.token);
      router.push('/dashboard');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; error?: string } } };
      setError(err?.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-[#003875] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center mb-4 border border-white/20">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Fikishwa Admin</h1>
          <p className="text-white/60 mt-1 text-sm">Operations Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step === 'phone' ? (
            <>
              <h2 className="text-xl font-bold text-textPrimary mb-1">Sign In</h2>
              <p className="text-sm text-textSecondary mb-6">Enter your admin email or phone number to receive an OTP.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1.5">Email or Phone Number</label>
                  <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                      placeholder="admin@fikishwa.com or 07XXXXXXXX"
                      className="flex-1 px-4 py-3 text-sm focus:outline-none text-textPrimary"
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2">{error}</p>}
                <button onClick={handleSendOtp} disabled={loading} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Sending OTP…' : 'Send OTP'}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-textPrimary mb-1">Enter OTP</h2>
              <p className="text-sm text-textSecondary mb-6">A 6-digit code was sent to your email or phone.</p>
              <div className="flex gap-2 justify-between mb-6">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) { otpRefs.current[i - 1]?.focus(); } }}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-textPrimary"
                  />
                ))}
              </div>
              {error && <p className="text-sm text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2 mb-4">{error}</p>}
              {loading && (
                <div className="flex items-center justify-center gap-2 py-2 text-sm text-textSecondary">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                </div>
              )}
              <button onClick={() => { setStep('phone'); setError(''); }} className="w-full text-sm text-textMuted mt-2 hover:text-primary transition-colors">
                ← Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
