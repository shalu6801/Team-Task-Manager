import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, LogIn, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../utils/format';

const Login = () => {
  const { user, login, loading } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    try {
      await login(values);
      navigate('/');
    } catch (error) {
      toast.error(apiError(error));
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your premium team workspace.">
      <form className="space-y-5" onSubmit={submit}>
        <FloatingInput label="Email" type="email" value={values.email} onChange={(email) => setValues({ ...values, email })} />
        <FloatingInput label="Password" type="password" value={values.password} onChange={(password) => setValues({ ...values, password })} />
        <button className="btn-primary w-full" disabled={loading}>
          <LogIn className="h-4 w-4" />
          {loading ? 'Signing in...' : 'Sign in'}
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="text-center text-sm font-medium text-slate-400">
          Need an account? <Link className="font-black text-violet-200 hover:text-white" to="/signup">Create one</Link>
        </p>
      </form>
    </AuthShell>
  );
};

export const AuthShell = ({ title, subtitle, children }) => (
  <div className="grid min-h-screen bg-[#0B0F19] lg:grid-cols-[1.08fr_0.92fr]">
    <div className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(124,58,237,0.42),transparent_26rem),radial-gradient(circle_at_78%_28%,rgba(34,197,94,0.13),transparent_22rem),linear-gradient(135deg,#0B0F19,#111827_52%,#0B0F19)]" />
      <div className="absolute inset-8 rounded-[2.25rem] border border-white/10 bg-white/[0.025] shadow-2xl shadow-black/40" />
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 font-black shadow-xl shadow-violet-950/40 ring-1 ring-violet-300/30">TT</div>
        <div><p className="font-black">Team Task Manager</p><p className="text-xs font-bold text-white/55">Project and task workspace</p></div>
      </div>
      <motion.div className="relative z-10 max-w-2xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <p className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-violet-200"><Sparkles className="h-4 w-4" /> Team workspace</p>
        <h1 className="text-6xl font-black leading-[1.02] tracking-tight">Run projects with startup-grade clarity.</h1>
        <p className="mt-6 max-w-lg text-base font-medium leading-7 text-white/62">
          Sign in to access your real workspace data, projects, assigned tasks, and dashboard analytics.
        </p>
        <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
          {['Admin and member access', 'Project and task tracking', 'Dashboard analytics'].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <CheckCircle2 className="mb-4 h-5 w-5 text-emerald-300" />
              <span className="text-sm font-bold leading-5 text-white/82">{item}</span>
            </div>
          ))}
        </div>
      </motion.div>
      <div className="relative z-10 grid grid-cols-3 gap-3 rounded-3xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
        <div>
          <p className="text-2xl font-black">24</p>
          <p className="mt-1 text-xs font-bold text-white/50">Task limit per page</p>
        </div>
        <div>
          <p className="text-2xl font-black">JWT</p>
          <p className="mt-1 text-xs font-bold text-white/50">Secure sessions</p>
        </div>
        <div>
          <p className="text-2xl font-black">2 roles</p>
          <p className="mt-1 text-xs font-bold text-white/50">Admin and member</p>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-center bg-[#0B0F19] p-8">
      <motion.div className="panel w-full max-w-md border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-black/40" initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
        <div className="mb-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-xl font-black text-white shadow-lg shadow-violet-950/40 ring-1 ring-violet-300/30">TT</div>
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
          <p className="mt-2 text-sm font-medium text-slate-400">{subtitle}</p>
        </div>
        {children}
      </motion.div>
    </div>
  </div>
);

export const FloatingInput = ({ label, type = 'text', value, onChange, children }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</span>
    {children || <input className="form-input" type={type} required value={value} onChange={(event) => onChange(event.target.value)} />}
  </label>
);

export default Login;
