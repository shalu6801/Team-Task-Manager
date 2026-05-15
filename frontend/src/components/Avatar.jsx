import { initials } from '../utils/format';

const Avatar = ({ name, className = '' }) => (
  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-sm font-black text-white shadow-lg shadow-violet-950/40 ring-1 ring-white/15 ${className}`}>
    {initials(name)}
  </div>
);

export default Avatar;
