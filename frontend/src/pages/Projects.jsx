import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Edit, Plus, Trash2, Users, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import api from '../services/api';
import { apiError, formatDate, statusLabels } from '../utils/format';

const blank = { title: '', description: '' };

const Projects = () => {
  const { isAdmin } = useAuth();
  const { data = [], loading, refetch } = useFetch(() => api.get('/projects'), []);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [removeId, setRemoveId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setShowForm(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setForm({ title: project.title, description: project.description });
    setShowForm(true);
  };

  const closeForm = () => {
    setEditing(null);
    setForm(blank);
    setShowForm(false);
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) await api.put(`/projects/${editing.id}`, form);
      else await api.post('/projects', form);
      toast.success(editing ? 'Project updated' : 'Project created');
      setEditing(null);
      setForm(blank);
      setShowForm(false);
      await refetch();
    } catch (error) {
      toast.error(apiError(error));
    }
  };

  const destroy = async () => {
    try {
      await api.delete(`/projects/${removeId}`);
      toast.success('Project deleted');
      setRemoveId(null);
      await refetch();
    } catch (error) {
      toast.error(apiError(error));
    }
  };

  if (loading) return <Spinner label="Loading projects" />;

  return (
    <motion.div className="page-shell" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Projects</h1>
          <p className="mt-2 text-sm font-medium text-slate-400">Modern project cards with progress, ownership, and task health.</p>
        </div>
        {isAdmin ? <button className="btn-primary" onClick={showForm && !editing ? closeForm : openCreate}><Plus className="h-4 w-4" /> {showForm && !editing ? 'Close form' : 'New project'}</button> : null}
      </div>

      <AnimatePresence>
        {isAdmin && showForm ? (
          <motion.form
            className="panel grid gap-4 p-5 lg:grid-cols-[1fr_2fr_auto_auto]"
            onSubmit={save}
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -12, height: 0 }}
          >
            <input className="form-input" autoFocus placeholder="Project title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="form-input" placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button className="btn-primary">{editing ? 'Update project' : 'Create project'}</button>
            <button type="button" className="btn-muted" onClick={closeForm}><X className="h-4 w-4" /> Cancel</button>
          </motion.form>
        ) : null}
      </AnimatePresence>

      {data.length === 0 ? <EmptyState title="No projects yet" text="Projects appear here when an admin creates them or assigns you tasks." /> : null}

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {data.map((project, index) => {
          const total = project.tasks.length;
          const completed = project.tasks.filter((task) => task.status === 'Completed').length;
          const progress = total ? Math.round((completed / total) * 100) : 0;
          const members = [...new Map(project.tasks.map((task) => [task.assignee.id, task.assignee])).values()];
          const deadline = project.tasks.map((task) => new Date(task.dueDate)).sort((a, b) => a - b)[0];

          return (
            <motion.div key={project.id} className="panel card-hover relative overflow-hidden p-5" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge tone={progress === 100 ? 'green' : 'blue'}>{progress === 100 ? 'Complete' : 'Active'}</Badge>
                  <h2 className="mt-4 text-xl font-black">{project.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">{project.description}</p>
                </div>
                {isAdmin ? (
                  <div className="flex gap-2">
                    <button className="btn-muted h-11 w-11 p-0" onClick={() => openEdit(project)} aria-label="Edit project" title="Edit project"><Edit className="h-5 w-5" strokeWidth={2.3} /></button>
                    <button className="btn-muted h-11 w-11 p-0 text-rose-600 dark:text-rose-200" onClick={() => setRemoveId(project.id)} aria-label="Delete project" title="Delete project"><Trash2 className="h-5 w-5" strokeWidth={2.3} /></button>
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm font-bold"><span>Progress</span><span>{progress}%</span></div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">Tasks</p>
                  <p className="mt-1 text-2xl font-black">{total}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">Done</p>
                  <p className="mt-1 text-2xl font-black">{completed}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-400">
                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{deadline ? formatDate(deadline) : formatDate(project.createdAt)}</div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4" />{members.length || 1}</div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {(members.length ? members : [project.creator]).slice(0, 4).map((member) => <Avatar key={member.id} name={member.name} className="h-9 w-9 text-xs ring-2 ring-slate-950" />)}
                </div>
                <p className="text-xs font-bold text-slate-400">Owner {project.creator.name}</p>
              </div>

              {project.tasks.length ? (
                <div className="mt-5 space-y-2">
                  {project.tasks.slice(0, 2).map((task) => (
                    <div key={task.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                      <span className="truncate text-sm font-bold">{task.title}</span>
                      <Badge tone={task.status === 'Completed' ? 'green' : task.status === 'Overdue' ? 'red' : 'blue'}>{statusLabels[task.status]}</Badge>
                    </div>
                  ))}
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </div>

      <ConfirmDialog open={Boolean(removeId)} title="Delete project" message="This also deletes all tasks in the project." onClose={() => setRemoveId(null)} onConfirm={destroy} />
    </motion.div>
  );
};

export default Projects;
