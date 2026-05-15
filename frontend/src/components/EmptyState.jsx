import { Inbox } from 'lucide-react';

const EmptyState = ({ title, text, action }) => (
  <div className="panel flex min-h-72 flex-col items-center justify-center border-dashed border-slate-700/80 p-10 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200 ring-1 ring-violet-400/20">
      <Inbox className="h-7 w-7" />
    </div>
    <h3 className="text-lg font-black">{title}</h3>
    <p className="mt-2 max-w-md text-sm font-medium text-slate-400">{text}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

export default EmptyState;
