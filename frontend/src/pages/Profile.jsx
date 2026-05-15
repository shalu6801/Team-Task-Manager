import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Save, Shield, UserRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { apiError, formatDate } from '../utils/format';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [values, setValues] = useState({ name: user.name, password: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { name: values.name };
      if (values.password) payload.password = values.password;
      const { data } = await api.put('/users/profile', payload);
      updateUser(data.user);
      setValues({ name: data.user.name, password: '' });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div className="page-shell max-w-5xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Settings</h1>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Manage your profile, identity, and password from one place.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="panel overflow-hidden">
          <div className="h-28 bg-gradient-to-br from-violet-700 via-purple-700 to-slate-900" />
          <div className="-mt-10 p-6">
            <Avatar name={user.name} className="h-20 w-20 text-2xl ring-4 ring-white dark:ring-slate-950" />
            <h2 className="mt-4 text-2xl font-black">{user.name}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400"><Mail className="h-4 w-4" />{user.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={user.role === 'Admin' ? 'blue' : 'slate'}><Shield className="mr-1 h-3 w-3" />{user.role}</Badge>
              <Badge tone="green">Active</Badge>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Joined</p>
              <p className="mt-1 font-black">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="text-xl font-black">Account settings</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep your display name and password current.</p>
          <form className="mt-6 grid gap-5" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400"><UserRound className="h-4 w-4" /> Name</span>
              <input className="form-input" required value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400"><Lock className="h-4 w-4" /> New password</span>
              <input className="form-input" type="password" minLength="8" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
            </label>
            <div><button className="btn-primary" disabled={saving}><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save profile'}</button></div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
