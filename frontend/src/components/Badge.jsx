import { cn } from '../utils/cn';

const Badge = ({ children, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-800/80 text-slate-300 ring-slate-700/80',
    blue: 'bg-violet-500/15 text-violet-200 ring-violet-400/25',
    green: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/25',
    orange: 'bg-amber-500/15 text-amber-200 ring-amber-400/25',
    red: 'bg-rose-500/15 text-rose-200 ring-rose-400/25'
  };
  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ring-1', tones[tone])}>{children}</span>;
};

export default Badge;
