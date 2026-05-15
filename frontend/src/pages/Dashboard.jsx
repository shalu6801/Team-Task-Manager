import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, FolderKanban, ListTodo, TimerOff, TrendingUp } from 'lucide-react';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { formatDate, statusLabels } from '../utils/format';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

/* ── Stat card ────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, tone = 'gold' }) => (
  <motion.div
    className="panel card-hover relative overflow-hidden"
    style={{ padding: '1.4rem 1.5rem' }}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {/* subtle top shimmer */}
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

/* ── Chart defaults ───────────────────────────────────── */
const chartDefaults = {
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0, color: '#5E5C6A', font: { family: "'DM Mono', monospace", size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false } },
    x: { ticks: { color: '#5E5C6A', font: { family: "'DM Mono', monospace", size: 11 } }, grid: { display: false }, border: { display: false } }
  }
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={ListTodo} label="Assigned" value={data.stats.totalTasks} tone="gold" />
          <StatCard icon={CheckCircle} label="Completed" value={data.stats.completedTasks} tone="emerald" />
          <StatCard icon={Clock} label="Pending" value={data.stats.pendingTasks} tone="amber" />
          <StatCard icon={TimerOff} label="Overdue" value={data.stats.overdueTasks} tone="rose" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Assigned Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {data.recentActivities.map(item => <ActivityItem key={item.id} item={item} />)}
            </div>
          </div>

          <div className="panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Upcoming Deadlines</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {data.recentActivities.slice(0, 4).map(item => (
                <div key={item.id} style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--ink-border)' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: "'Playfair Display', serif" }}>{item.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.project}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Admin view ── */
  const completion = data.stats.totalTasks ? Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100) : 0;

  const statusData = {
    labels: data.charts.byStatus.map(i => statusLabels[i.status]),
    datasets: [{
      data: data.charts.byStatus.map(i => i._count.status),
      backgroundColor: ['#C9A84C', '#4ECDC4', '#52C47A', '#E8574A'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  const priorityData = {
    labels: data.charts.byPriority.map(i => i.priority),
    datasets: [{
      label: 'Tasks',
      data: data.charts.byPriority.map(i => i._count.priority),
      backgroundColor: ['#E8574A', '#C9A84C', '#52C47A'],
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  return (
    <motion.div className="page-shell" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Command center</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '34rem' }}>
              Live team progress, workload health, priority mix, and delivery risk.
            </p>
          </div>

          {/* Productivity badge */}
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
      </div>

      {/* ── Stat grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={FolderKanban} label="Projects"  value={data.stats.totalProjects}  tone="gold" />
        <StatCard icon={ListTodo}    label="Total Tasks" value={data.stats.totalTasks}     tone="teal" />
        <StatCard icon={CheckCircle} label="Completed"  value={data.stats.completedTasks}  tone="emerald" />
        <StatCard icon={Clock}       label="Pending"    value={data.stats.pendingTasks}    tone="amber" />
        <StatCard icon={TimerOff}    label="Overdue"    value={data.stats.overdueTasks}    tone="rose" />
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">

        {/* Task Progress */}
        <div className="panel card-hover" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Task Progress</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Status distribution across active work</p>
            </div>
            <span className="tone-gold" style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '99px', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
              {completion}%
            </span>
          </div>

          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '220px 1fr', alignItems: 'center' }}>
            <div style={{ maxWidth: '220px' }}>
              <Doughnut data={statusData} options={{ cutout: '74%', plugins: { legend: { display: false } } }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.charts.byStatus.map((item, i) => {
                const pct = data.stats.totalTasks ? Math.round((item._count.status / data.stats.totalTasks) * 100) : 0;
                const colors = ['var(--gold)', 'var(--teal)', 'var(--emerald)', 'var(--rose)'];
                return (
                  <div key={item.status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{statusLabels[item.status]}</span>
                      <span style={{ fontSize: '0.75rem', fontFamily: "'DM Mono', monospace", color: 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '99px', background: 'var(--ink-surface)', overflow: 'hidden' }}>
                      <motion.div
                        style={{ height: '100%', borderRadius: '99px', background: colors[i] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority Mix */}
        <div className="panel card-hover" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Priority Mix</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1.25rem' }}>How work is weighted today</p>
          <Bar data={priorityData} options={chartDefaults} />
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">

        {/* Recent Activity */}
        <div className="panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {data.recentActivities.map(item => <ActivityItem key={item.id} item={item} showAssignee />)}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Overdue alert */}
          <div style={{
            borderRadius: '1rem',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(232,87,74,0.18) 0%, rgba(201,168,76,0.08) 100%)',
            border: '1px solid rgba(232,87,74,0.25)'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,87,74,0.15), transparent)', transform: 'translate(30%, -30%)' }} />
            <AlertTriangle size={24} color="#F87B71" style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.14em', textTransform: 'uppercase', color: '#F87B71', marginBottom: '0.25rem' }}>Overdue alerts</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.75rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{data.stats.overdueTasks}</p>
            <p style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tasks need attention before they slow delivery.</p>
          </div>

          {/* Upcoming deadlines */}
          <div className="panel" style={{ padding: '1.5rem', flex: 1 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Upcoming Deadlines</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {data.recentActivities.slice(0, 3).map((item, i) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.65rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--ink-border)' }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--gold)', minWidth: '1.2rem' }}>0{i + 1}</span>
                  <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.1rem' }}>{item.title}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.project}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;