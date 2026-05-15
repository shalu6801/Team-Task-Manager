const StatCard = ({ icon: Icon, label, value, tone = 'blue' }) => {
  const tones = {
    blue: 'from-violet-500/25 to-violet-500/5 text-violet-200 ring-violet-400/20',
    green: 'from-emerald-500/25 to-emerald-500/5 text-emerald-200 ring-emerald-400/20',
    orange: 'from-amber-500/25 to-amber-500/5 text-amber-200 ring-amber-400/20',
    red: 'from-rose-500/25 to-rose-500/5 text-rose-200 ring-rose-400/20'
  };

  return (
    <div className="panel card-hover relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
