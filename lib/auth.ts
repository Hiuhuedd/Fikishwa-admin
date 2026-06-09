export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fikishwa_admin_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('fikishwa_admin_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('fikishwa_admin_token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const formatCurrency = (amount: number): string => {
  return `KES ${(amount || 0).toLocaleString('en-KE')}`;
};

export const formatDate = (ts: string | { seconds: number } | undefined): string => {
  if (!ts) return 'N/A';
  const date = typeof ts === 'object' && 'seconds' in ts
    ? new Date(ts.seconds * 1000)
    : new Date(ts);
  return date.toLocaleDateString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};
