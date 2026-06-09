export default function LoadingSpinner({ fullScreen = false, message }: { fullScreen?: boolean; message?: string }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" style={{ borderWidth: 3 }} />
      {message && <p className="text-sm text-textSecondary">{message}</p>}
    </div>
  );
  if (fullScreen) return <div className="flex-1 flex items-center justify-center min-h-[300px]">{inner}</div>;
  return inner;
}
