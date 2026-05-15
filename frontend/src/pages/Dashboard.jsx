import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, ChevronDown, Clock, FolderKanban, ListTodo, Search, TimerOff, TrendingUp, X } from 'lucide-react';
import Spinner from '../components/Spinner';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { formatDate, statusLabels } from '../utils/format';

/* ── Stat card ────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, tone = 'gold' }) => (
  <motion.div
    className="panel card-hover relative overflow-hidden"
    style={{ padding: '1.4rem 1.5rem' }}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div style={{ position: 'absolute', inset: '0 0 auto', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)' }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '0.7rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>{label}</p>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
      </div>
      <div className={`tone-${tone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', flexShrink: 0 }}>
        <Icon size={18} />
      </div>
    </div>
  </motion.div>
);

/* ── Pending task alert banner ────────────────────────── */
const PendingTaskBanner = ({ tasks }) => {
  const [expanded, setExpanded] = useState(false);
  if (!tasks || tasks.length === 0) return null;

  const overdueCount = tasks.filter(t =>
    t.status === 'Overdue' || new Date(t.dueDate) < new Date()
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: '1rem',
        overflow: 'hidden',
        border: `1px solid ${overdueCount > 0 ? 'rgba(232,87,74,0.35)' : 'rgba(245,165,36,0.35)'}`,
        background: overdueCount > 0
          ? 'linear-gradient(135deg, rgba(232,87,74,0.12) 0%, rgba(201,168,76,0.06) 100%)'
          : 'linear-gradient(135deg, rgba(245,165,36,0.12) 0%, rgba(201,168,76,0.06) 100%)'
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <AlertTriangle size={18} color={overdueCount > 0 ? '#F87B71' : '#F5A524'} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: overdueCount > 0 ? '#F87B71' : '#F5A524',
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            {overdueCount > 0
              ? `${overdueCount} overdue · ${tasks.length} total pending`
              : `${tasks.length} task${tasks.length > 1 ? 's' : ''} pending`}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            {overdueCount > 0
              ? 'Kuch tasks ki deadline nikal gayi hai — inhe jaldi complete karein.'
              : 'Complete the pending tasks at your earliest convenience.'}
          </p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown size={16} color="var(--text-muted)" />
        </motion.div>
      </button>

      {/* Task list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tasks.map(task => {
                const isOverdue = task.status === 'Overdue' || new Date(task.dueDate) < new Date();
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.7rem 0.9rem',
                      borderRadius: '0.65rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isOverdue ? 'rgba(232,87,74,0.2)' : 'var(--ink-border)'}`
                    }}
                  >
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                      background: isOverdue ? '#E8574A' : task.status === 'InProgress' ? 'var(--teal)' : 'var(--amber)'
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {task.project} · Due {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <span className={`tone-${isOverdue ? 'rose' : task.status === 'InProgress' ? 'teal' : 'amber'}`}
                      style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", padding: '0.15rem 0.55rem', borderRadius: '99px', flexShrink: 0 }}>
                      {isOverdue && task.status !== 'Overdue' ? 'Overdue' : statusLabels[task.status]}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Activity item ────────────────────────────────────── */
const ActivityItem = ({ item, showAssignee = false }) => {
  const toneMap = { Completed: 'emerald', Overdue: 'rose', Pending: 'amber', InProgress: 'teal' };
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.9rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--ink-border)' }}>
      <div style={{ flexShrink: 0, marginTop: '0.25rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 6px var(--gold-glow)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{item.title}</p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {item.project}{showAssignee ? ` · ${item.assignee}` : ''}
        </p>
      </div>
      <div style={{ flexShrink: 0 }}>
        <span className={`tone-${toneMap[item.status] || 'gold'}`} style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '99px', padding: '0.2rem 0.7rem', fontSize: '0.68rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', fontWeight: 500 }}>
          {statusLabels[item.status]}
        </span>
      </div>
    </div>
  );
};

/* ── Admin: Assignee Stats Dropdown ───────────────────── */
const AssigneeStatsPanel = ({ assigneeStats }) => {
  const [period, setPeriod] = useState('weekly');
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');

  const currentStats = assigneeStats?.[period] || [];
  const filteredStats = currentStats.filter(m =>
    m.memberName.toLowerCase().includes(search.toLowerCase()) ||
    (m.memberEmail && m.memberEmail.toLowerCase().includes(search.toLowerCase()))
  );
  const periodLabels = { weekly: 'This Week', monthly: 'This Month', yearly: 'This Year' };

  const StatPill = ({ label, value, tone }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      padding: '0.3rem 0.7rem', borderRadius: '99px',
      background: tone === 'emerald' ? 'var(--emerald-dim)' : tone === 'rose' ? 'var(--rose-dim)' : tone === 'amber' ? 'var(--amber-dim)' : 'var(--teal-dim)',
      border: `1px solid ${tone === 'emerald' ? 'rgba(82,196,122,0.2)' : tone === 'rose' ? 'rgba(232,87,74,0.2)' : tone === 'amber' ? 'rgba(245,165,36,0.2)' : 'rgba(78,205,196,0.2)'}`
    }}>
      <span style={{ fontSize: '0.7rem', fontFamily: "'DM Mono', monospace", fontWeight: 600, color: tone === 'emerald' ? 'var(--emerald)' : tone === 'rose' ? '#F87B71' : tone === 'amber' ? 'var(--amber)' : 'var(--teal)' }}>
        {value}
      </span>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );

  return (
    <div className="panel" style={{ padding: '1.5rem' }}>
      {/* Header with period selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Team Performance
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Assignee-wise task breakdown
          </p>
        </div>
        {/* Period dropdown */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--ink-surface)', borderRadius: '0.65rem', padding: '0.25rem', border: '1px solid var(--ink-border)' }}>
          {['weekly', 'monthly', 'yearly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontFamily: "'DM Mono', monospace",
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'all 0.15s',
                background: period === p ? 'var(--ink-card)' : 'transparent',
                color: period === p ? 'var(--gold)' : 'var(--text-muted)',
                boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                borderColor: period === p ? 'var(--ink-border-light)' : 'transparent'
              }}
            >
              {p === 'weekly' ? 'Week' : p === 'monthly' ? 'Month' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
        <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search by name or email of member"
          value={search}
          onChange={e => { setSearch(e.target.value); setOpenId(null); }}
          style={{
            width: '100%',
            padding: '0.55rem 2.2rem 0.55rem 2.2rem',
            borderRadius: '0.65rem',
            border: '1px solid var(--ink-border-light)',
            background: 'var(--ink-surface)',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s, box-shadow 0.15s'
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px var(--gold-glow-soft)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--ink-border-light)'; e.target.style.boxShadow = 'none'; }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem', display: 'flex', alignItems: 'center' }}
          >
            <X size={13} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Period label */}
      <p style={{ fontSize: '0.7rem', fontFamily: "'DM Mono', monospace", color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
        {periodLabels[period]}
      </p>

      {/* Members list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredStats.length === 0 && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
            {search ? `"${search}" se koi member nahi mila.` : 'Is period mein koi data nahi mila.'}
          </p>
        )}
        {filteredStats.map(member => {
          const isOpen = openId === member.memberId;
          const completionPct = member.total > 0 ? Math.round((member.completed / member.total) * 100) : 0;

          return (
            <div
              key={member.memberId}
              style={{
                borderRadius: '0.75rem',
                border: `1px solid ${isOpen ? 'var(--gold-dim)' : 'var(--ink-border)'}`,
                background: isOpen ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.02)',
                overflow: 'hidden',
                transition: 'border-color 0.15s, background 0.15s'
              }}
            >
              {/* Row header — clickable */}
              <button
                onClick={() => setOpenId(isOpen ? null : member.memberId)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.8rem 1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'
                }}
              >
                {/* Avatar initials */}
                <div style={{
                  width: '34px', height: '34px', borderRadius: '0.5rem', flexShrink: 0,
                  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 800, color: '#fff'
                }}>
                  {member.memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {member.memberName}
                  </p>
                  {/* Mini progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1, height: '4px', borderRadius: '99px', background: 'var(--ink-surface)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '99px', background: 'var(--emerald)', width: `${completionPct}%`, transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", color: 'var(--text-muted)', flexShrink: 0 }}>
                      {completionPct}%
                    </span>
                  </div>
                </div>

                {/* Quick count pills */}
                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                  <StatPill label="done" value={member.completed} tone="emerald" />
                  {member.overdue > 0 && <StatPill label="late" value={member.overdue} tone="rose" />}
                </div>

                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
                  <ChevronDown size={15} color="var(--text-muted)" />
                </motion.div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 1rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                      {[
                        { label: 'Completed', value: member.completed, tone: 'emerald', icon: '✓' },
                        { label: 'Pending', value: member.pending, tone: 'amber', icon: '○' },
                        { label: 'In Progress', value: member.inProgress, tone: 'teal', icon: '◑' },
                        { label: 'Overdue', value: member.overdue, tone: 'rose', icon: '!' },
                      ].map(stat => (
                        <div
                          key={stat.label}
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderRadius: '0.6rem',
                            background: 'var(--ink-surface)',
                            border: '1px solid var(--ink-border)',
                            display: 'flex', alignItems: 'center', gap: '0.6rem'
                          }}
                        >
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700,
                            color: stat.tone === 'emerald' ? 'var(--emerald)' : stat.tone === 'rose' ? '#F87B71' : stat.tone === 'amber' ? 'var(--amber)' : 'var(--teal)'
                          }}>
                            {stat.icon}
                          </span>
                          <div>
                            <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{stat.label}</p>
                          </div>
                        </div>
                      ))}
                      {member.total > 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '0.5rem 0.85rem', borderRadius: '0.6rem', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total tasks this period</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold)', fontFamily: "'DM Mono', monospace" }}>{member.total}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Member: Task Status Sections ─────────────────────── */
const MemberTaskSection = ({ data }) => {
  const allTasks = data?.recentActivities || [];
  const completed = allTasks.filter(t => t.status === 'Completed');
  const pending = allTasks.filter(t => t.status === 'Pending' || t.status === 'InProgress');
  const overdue = allTasks.filter(t => t.status === 'Overdue' || (new Date(t.dueDate) < new Date() && t.status !== 'Completed'));

  const Section = ({ title, tasks, tone, emptyMsg }) => {
    const toneMap = { emerald: 'var(--emerald)', amber: 'var(--amber)', rose: '#F87B71' };
    return (
      <div className="panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: toneMap[tone], flexShrink: 0 }} />
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", color: toneMap[tone], background: `${toneMap[tone]}18`, border: `1px solid ${toneMap[tone]}33`, borderRadius: '99px', padding: '0.15rem 0.5rem' }}>
            {tasks.length}
          </span>
        </div>
        {tasks.length === 0
          ? <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>{emptyMsg}</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {tasks.map(item => (
                <div key={item.id} style={{ padding: '0.65rem 0.85rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--ink-border)' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.project}</p>
                </div>
              ))}
            </div>
        }
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
      <Section title="Completed" tasks={completed} tone="emerald" emptyMsg="Abhi tak koi task complete nahi hua." />
      <Section title="Pending / In Progress" tasks={pending} tone="amber" emptyMsg="Koi pending task nahi hai." />
      <Section title="Overdue" tasks={overdue} tone="rose" emptyMsg="Koi overdue task nahi hai. " />
    </div>
  );
};

/* ── Dashboard ────────────────────────────────────────── */
const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { data, loading } = useFetch(() => api.get('/dashboard'), []);

  if (loading) return <Spinner label="Loading dashboard" />;

  /* ── Member view ── */
  if (!isAdmin) {
    return (
      <motion.div className="page-shell" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>My workspace</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>My Tasks</h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Your assigned work, current status, and upcoming reminders.</p>
        </div>

        {/* Pending task alert banner */}
        <PendingTaskBanner tasks={data.pendingTasksList} />

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={ListTodo}    label="Assigned"  value={data.stats.totalTasks}      tone="gold" />
          <StatCard icon={CheckCircle} label="Completed" value={data.stats.completedTasks}   tone="emerald" />
          <StatCard icon={Clock}       label="Pending"   value={data.stats.pendingTasks}     tone="amber" />
          <StatCard icon={TimerOff}    label="Overdue"   value={data.stats.overdueTasks}     tone="rose" />
        </div>

        {/* Completed / Pending / Overdue sections */}
        <MemberTaskSection data={data} />
      </motion.div>
    );
  }

  /* ── Admin view ── */
  const completion = data.stats.totalTasks ? Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100) : 0;

  return (
    <motion.div className="page-shell" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Command center</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '34rem' }}>
            Live team progress, workload health, and delivery risk.
          </p>
        </div>
        <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.2rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '0.65rem', background: 'var(--emerald-dim)', border: '1px solid rgba(82,196,122,0.2)' }}>
            <TrendingUp size={17} color="var(--emerald)" />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Productivity</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginTop: '0.1rem' }}>{completion}%</p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={FolderKanban} label="Projects"   value={data.stats.totalProjects}  tone="gold" />
        <StatCard icon={ListTodo}    label="Total Tasks" value={data.stats.totalTasks}      tone="teal" />
        <StatCard icon={CheckCircle} label="Completed"   value={data.stats.completedTasks}  tone="emerald" />
        <StatCard icon={Clock}       label="Pending"     value={data.stats.pendingTasks}    tone="amber" />
        <StatCard icon={TimerOff}    label="Overdue"     value={data.stats.overdueTasks}    tone="rose" />
      </div>

      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">

        {/* Team performance panel */}
        <AssigneeStatsPanel assigneeStats={data.assigneeStats} />

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Overdue alert */}
          <div style={{
            borderRadius: '1rem', padding: '1.5rem', position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(232,87,74,0.18) 0%, rgba(201,168,76,0.08) 100%)',
            border: '1px solid rgba(232,87,74,0.25)'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,87,74,0.15), transparent)', transform: 'translate(30%, -30%)' }} />
            <AlertTriangle size={24} color="#F87B71" style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.14em', textTransform: 'uppercase', color: '#F87B71', marginBottom: '0.25rem' }}>Overdue alerts</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.75rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{data.stats.overdueTasks}</p>
            <p style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tasks need attention before they slow delivery.</p>
          </div>

          {/* Recent activity */}
          <div className="panel" style={{ padding: '1.5rem', flex: 1 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Recent Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {data.recentActivities.map(item => <ActivityItem key={item.id} item={item} showAssignee />)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;