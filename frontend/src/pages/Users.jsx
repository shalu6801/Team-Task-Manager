import { motion } from 'framer-motion';
import { Activity, Crown, Mail, Shield, Sparkles } from 'lucide-react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import { useFetch } from '../hooks/useFetch';
import api from '../services/api';
import { formatDate } from '../utils/format';

const Users = () => {
  const { data = [], loading } = useFetch(() => api.get('/users'), []);

  if (loading) return <Spinner label="Loading team" />;

  return (
    <motion.div className="page-shell" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <p className="eyebrow">Team hub</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Team</h1>
        <p className="mt-2 text-sm font-medium text-slate-400">Team cards with role, workload, ownership, and availability signals.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.map((user, index) => {
          const total = user.counts.assignedTasks + user.counts.projects;
          const productivity = Math.min(100, total * 18 + (user.role === 'Admin' ? 18 : 8));
          const signalValue = user.role === 'Admin' ? Math.min(100, user.counts.projects * 30 + 40) : productivity;
          return (
            <motion.div key={user.id} className="panel card-hover overflow-hidden p-5" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar name={user.name} className="h-16 w-16 text-lg" />
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-950 bg-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-black">{user.name}</h2>
                      {/* Member ID badge */}
                      <span
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-black"
                        style={{
                          background: 'rgba(201,168,76,0.1)',
                          border: '1px solid rgba(201,168,76,0.25)',
                          color: 'var(--gold)',
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        ID {user.id}
                      </span>
                    </div>
                    <p className="mt-1 flex min-w-0 items-center gap-1 text-sm font-medium text-slate-400">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </p>
                  </div>
                </div>
                <Badge tone={user.role === 'Admin' ? 'blue' : 'slate'}>
                  <Shield className="mr-1 h-3 w-3" />{user.role}
                </Badge>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">Tasks</p>
                  <p className="mt-1 text-2xl font-black">{user.counts.assignedTasks}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">Projects</p>
                  <p className="mt-1 text-2xl font-black">{user.counts.projects}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm font-bold">
                  {user.role === 'Admin' ? (
                    <>
                      <span className="flex items-center gap-2"><Crown className="h-4 w-4 text-violet-300" /> Workspace owner</span>
                      <span>{user.counts.projects} projects</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-violet-300" /> Workload</span>
                      <span>{productivity}%</span>
                    </>
                  )}
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400" style={{ width: `${signalValue}%` }} />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-sm">
                <p className="font-semibold text-slate-400">Joined {formatDate(user.createdAt)}</p>
                <p className="flex items-center gap-1 font-black text-violet-200"><Sparkles className="h-3.5 w-3.5" /> Online</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Users;