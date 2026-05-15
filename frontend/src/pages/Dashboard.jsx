import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, FolderKanban, ListTodo, Target, TimerOff, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { formatDate, statusLabels } from '../utils/format';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { data, loading } = useFetch(() => api.get('/dashboard'), []);

  if (loading) return <Spinner label="Loading dashboard" />;

  if (!isAdmin) {
    return (
      <motion.div className="page-shell" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <p className="eyebrow">My workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">My Tasks</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-400">
            Your assigned work, current status, and upcoming task reminders.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={ListTodo} label="Assigned Tasks" value={data.stats.totalTasks} />
          <StatCard icon={CheckCircle} label="Completed" value={data.stats.completedTasks} tone="green" />
          <StatCard icon={Clock} label="Pending" value={data.stats.pendingTasks} tone="orange" />
          <StatCard icon={TimerOff} label="Overdue" value={data.stats.overdueTasks} tone="red" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="panel p-6">
            <h2 className="text-lg font-black">Assigned Activity</h2>
            <div className="mt-5 space-y-4">
              {data.recentActivities.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-black">{item.title}</p>
                      <p className="text-sm text-slate-400">{item.project}</p>
                    </div>
                    <Badge tone={item.status === 'Completed' ? 'green' : item.status === 'Overdue' ? 'red' : 'blue'}>{statusLabels[item.status]}</Badge>
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-400">{formatDate(item.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-6">
            <h2 className="font-black">Upcoming Deadlines</h2>
            <div className="mt-4 space-y-3">
              {data.recentActivities.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-black">{item.title}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{item.project}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const completion = data.stats.totalTasks ? Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100) : 0;
  const statusData = {
    labels: data.charts.byStatus.map((item) => statusLabels[item.status]),
    datasets: [
      {
        data: data.charts.byStatus.map((item) => item._count.status),
        backgroundColor: ['#7C3AED', '#F59E0B', '#22C55E', '#EF4444'],
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  };
  const priorityData = {
    labels: data.charts.byPriority.map((item) => item.priority),
    datasets: [
      {
        label: 'Tasks',
        data: data.charts.byPriority.map((item) => item._count.priority),
        backgroundColor: ['#EF4444', '#22C55E', '#7C3AED'],
        borderRadius: 14
      }
    ]
  };

  return (
    <motion.div className="page-shell" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Command center</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-400">
            Live team progress, workload health, priority mix, and upcoming delivery risk.
          </p>
        </div>
        <div className="panel flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Productivity</p>
            <p className="text-2xl font-black">{completion}% complete</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={FolderKanban} label="Projects" value={data.stats.totalProjects} />
        <StatCard icon={ListTodo} label="Total Tasks" value={data.stats.totalTasks} />
        <StatCard icon={CheckCircle} label="Completed" value={data.stats.completedTasks} tone="green" />
        <StatCard icon={Clock} label="Pending" value={data.stats.pendingTasks} tone="orange" />
        <StatCard icon={TimerOff} label="Overdue" value={data.stats.overdueTasks} tone="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="panel card-hover p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Task Progress</h2>
              <p className="text-sm text-slate-400">Status distribution across active work</p>
            </div>
            <Badge tone="blue"><Target className="mr-1 h-3 w-3" />{completion}%</Badge>
          </div>
          <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-center">
            <div className="mx-auto max-w-64"><Doughnut data={statusData} options={{ cutout: '72%', plugins: { legend: { display: false } } }} /></div>
            <div className="space-y-4">
              {data.charts.byStatus.map((item) => {
                const percent = data.stats.totalTasks ? Math.round((item._count.status / data.stats.totalTasks) * 100) : 0;
                return (
                  <div key={item.status}>
                    <div className="mb-2 flex justify-between text-sm font-bold"><span>{statusLabels[item.status]}</span><span>{percent}%</span></div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel card-hover p-6">
          <h2 className="text-lg font-black">Priority Mix</h2>
          <p className="mb-5 text-sm text-slate-400">How work is weighted today</p>
          <Bar data={priorityData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0, color: '#9CA3AF' }, grid: { color: 'rgba(156,163,175,0.12)' } }, x: { ticks: { color: '#9CA3AF' }, grid: { display: false } } } }} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="panel p-6">
          <h2 className="text-lg font-black">Recent Activity</h2>
          <div className="mt-5 space-y-4">
            {data.recentActivities.map((item, index) => (
              <div key={item.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-violet-400 ring-4 ring-violet-500/20" />
                  {index < data.recentActivities.length - 1 ? <div className="mt-2 h-full w-px bg-white/10" /> : null}
                </div>
                <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-black">{item.title}</p>
                      <p className="text-sm text-slate-400">{item.project} assigned to {item.assignee}</p>
                    </div>
                    <Badge tone={item.status === 'Completed' ? 'green' : item.status === 'Overdue' ? 'red' : 'blue'}>{statusLabels[item.status]}</Badge>
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-400">{formatDate(item.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel bg-gradient-to-br from-rose-500/90 to-violet-700/90 p-6 text-white">
            <AlertTriangle className="mb-8 h-8 w-8" />
            <p className="text-sm font-bold uppercase text-white/70">Overdue alerts</p>
            <p className="mt-2 text-4xl font-black">{data.stats.overdueTasks}</p>
            <p className="mt-2 text-sm text-white/75">Tasks need attention before they slow delivery.</p>
          </div>
          <div className="panel p-6">
            <h2 className="font-black">Upcoming Deadlines</h2>
            <div className="mt-4 space-y-3">
              {data.recentActivities.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-black">{item.title}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{item.project}</p>
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
