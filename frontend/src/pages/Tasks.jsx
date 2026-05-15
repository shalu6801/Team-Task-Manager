import { useEffect, useMemo, useState } from 'react';
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { CalendarDays, Edit, GripVertical, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { apiError, formatDate, isPastDue, priorityOptions, statusLabels, statusOptions } from '../utils/format';

const blankTask = { title: '', description: '', status: 'Pending', priority: 'Medium', dueDate: '', assignedTo: '', projectId: '' };
const columnTone = {
  Pending: 'border-violet-400/15 bg-violet-500/[0.055]',
  InProgress: 'border-amber-400/15 bg-amber-500/[0.055]',
  Completed: 'border-emerald-400/15 bg-emerald-500/[0.055]',
  Overdue: 'border-rose-400/15 bg-rose-500/[0.055]'
};

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', page: 1 });
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankTask);
  const [removeId, setRemoveId] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks', { params: { ...filters, limit: 24 } });
      setTasks(data.data);
      setMeta(data.meta);
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filters]);

  useEffect(() => {
    api.get('/projects').then(({ data }) => setProjects(data));
    if (isAdmin) api.get('/users').then(({ data }) => setUsers(data));
  }, [isAdmin]);

  const columns = useMemo(
    () => statusOptions.map((status) => ({ status, tasks: tasks.filter((task) => task.status === status) })),
    [tasks]
  );
  const memberUsers = useMemo(() => users.filter((user) => user.role === 'Member'), [users]);

  const openCreate = () => {
    setEditing(null);
    setForm(blankTask);
    setModal(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setForm({ title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate.slice(0, 10), assignedTo: task.assignedTo, projectId: task.projectId });
    setModal(true);
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) await api.put(`/tasks/${editing.id}`, form);
      else await api.post('/tasks', form);
      toast.success(editing ? 'Task updated' : 'Task created');
      setModal(false);
      await loadTasks();
    } catch (error) {
      toast.error(apiError(error));
    }
  };

  const quickStatus = async (task, status) => {
    if (task.status === status) return;
    try {
      await api.put(`/tasks/${task.id}`, { status });
      toast.success('Status updated');
      await loadTasks();
    } catch (error) {
      toast.error(apiError(error));
    }
  };

  const onDragEnd = ({ active, over }) => {
    if (!over) return;
    const task = tasks.find((item) => item.id === Number(active.id));
    if (task) quickStatus(task, over.id);
  };

  const destroy = async () => {
    try {
      await api.delete(`/tasks/${removeId}`);
      toast.success('Task deleted');
      setRemoveId(null);
      await loadTasks();
    } catch (error) {
      toast.error(apiError(error));
    }
  };

  return (
    <motion.div className="page-shell" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Task board</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Tasks</h1>
          <p className="mt-2 text-sm font-medium text-slate-400">Organize tasks by status, priority, assignee, and deadline.</p>
        </div>
        {isAdmin ? <button className="btn-primary" onClick={openCreate}><Plus className="h-4 w-4" /> New task</button> : null}
      </div>

      <div className="panel grid gap-3 p-4 lg:grid-cols-[1fr_220px_220px]">
        <label className="relative"><Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="form-input !pl-12" placeholder="Search tasks" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} /></label>
        <select className="form-input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}><option value="">All statuses</option>{statusOptions.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select>
        <select className="form-input" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}><option value="">All priorities</option>{priorityOptions.map((priority) => <option key={priority}>{priority}</option>)}</select>
      </div>

      {loading ? <Spinner label="Loading tasks" /> : tasks.length === 0 ? <EmptyState title="No tasks found" text="Try changing filters or create a new task." /> : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid gap-4 xl:grid-cols-4">
            {columns.map((column) => (
              <TaskColumn key={column.status} status={column.status} tasks={column.tasks}>
                {column.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} isAdmin={isAdmin} openEdit={openEdit} setRemoveId={setRemoveId} />
                ))}
              </TaskColumn>
            ))}
          </div>
        </DndContext>
      )}

      {!loading && tasks.length > 0 && meta.pages > 1 ? (
        <div className="flex items-center justify-end gap-3">
          <button className="btn-muted" disabled={meta.page <= 1} onClick={() => setFilters({ ...filters, page: meta.page - 1 })}>Previous</button>
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Page {meta.page} of {meta.pages}</span>
          <button className="btn-muted" disabled={meta.page >= meta.pages} onClick={() => setFilters({ ...filters, page: meta.page + 1 })}>Next</button>
        </div>
      ) : null}

      <Modal open={modal} title={editing ? 'Edit task' : 'Create task'} onClose={() => setModal(false)}>
        <form className="grid gap-4" onSubmit={save}>
          <input className="form-input" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="form-input min-h-28" placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2"><select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statusOptions.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select><select className="form-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{priorityOptions.map((priority) => <option key={priority}>{priority}</option>)}</select></div>
          <div className="grid gap-4 sm:grid-cols-3"><input className="form-input" type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /><select className="form-input" required value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}><option value="">Project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select><select className="form-input" required value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}><option value="">Assignee</option>{memberUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></div>
          <div className="flex justify-end gap-3"><button type="button" className="btn-muted" onClick={() => setModal(false)}>Cancel</button><button className="btn-primary">{editing ? 'Update task' : 'Create task'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog open={Boolean(removeId)} title="Delete task" message="This task will be permanently removed." onClose={() => setRemoveId(null)} onConfirm={destroy} />
    </motion.div>
  );
};

const TaskColumn = ({ status, tasks, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} className={`min-h-96 rounded-2xl border p-3 transition ${columnTone[status]} ${isOver ? 'ring-4 ring-violet-300/20' : ''}`}>
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="font-black">{statusLabels[status]}</h2>
        <span className="rounded-full bg-slate-950/60 px-3 py-1 text-xs font-black text-slate-200 ring-1 ring-white/10">{tasks.length}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
};

const TaskCard = ({ task, isAdmin, openEdit, setRemoveId }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: String(task.id) });
  const style = { transform: CSS.Translate.toString(transform), zIndex: isDragging ? 30 : undefined };
  return (
    <motion.div ref={setNodeRef} style={style} className={`panel card-hover cursor-grab p-4 active:cursor-grabbing ${isDragging ? 'opacity-80 shadow-xl' : ''} ${isPastDue(task) ? 'ring-2 ring-rose-400/30' : ''}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <button className="shrink-0 text-slate-500 hover:text-violet-200" {...listeners} {...attributes} aria-label="Drag task"><GripVertical className="h-4 w-4" /></button>
        {isAdmin ? (
          <div className="flex shrink-0 gap-1.5">
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/12 text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-500/18 dark:text-violet-200"
              onClick={() => openEdit(task)}
              aria-label="Edit task"
              title="Edit task"
            >
              <Edit className="h-5 w-5" strokeWidth={2.3} />
            </button>
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-500/12 text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-500/18 dark:text-rose-200"
              onClick={() => setRemoveId(task.id)}
              aria-label="Delete task"
              title="Delete task"
            >
              <Trash2 className="h-5 w-5" strokeWidth={2.3} />
            </button>
          </div>
        ) : null}
      </div>
      <div className="min-w-0">
        <h3 className="line-clamp-2 overflow-hidden text-ellipsis text-base font-black leading-6">{task.title}</h3>
        <p className="mt-2 line-clamp-2 overflow-hidden text-ellipsis text-sm leading-6 text-slate-400">{task.description}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2"><Badge tone={task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'orange' : 'green'}>{task.priority}</Badge><Badge tone={task.status === 'Completed' ? 'green' : task.status === 'Overdue' ? 'red' : 'blue'}>{statusLabels[task.status]}</Badge></div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><CalendarDays className="h-3.5 w-3.5" />{formatDate(task.dueDate)}</div>
        <Avatar name={task.assignee.name} className="h-8 w-8 rounded-xl text-[11px]" />
      </div>
      <p className="mt-3 text-xs font-bold text-slate-400">{task.project.title}</p>
    </motion.div>
  );
};

export default Tasks;
