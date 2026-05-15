const Spinner = ({ label = 'Loading' }) => (
  <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-semibold text-slate-400">
    <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-800 border-t-violet-400" />
    <span>{label}</span>
  </div>
);

export default Spinner;
