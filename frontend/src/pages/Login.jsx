import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../utils/format';

export const AuthShell = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex" style={{ background: 'var(--obsidian)' }}>
    {/* Left */}
    <div className="auth-left hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.035]" style={{
        backgroundImage: 'linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)',
        backgroundSize: '64px 64px',
      }} />
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black" style={{ background: 'var(--gold)', color: '#0a0800' }}>TT</div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>TeamTask</p>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>Project workspace</p>
        </div>
      </div>
      <motion.div className="relative" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className="eyebrow mb-4">Team workspace</p>
        <h1 className="text-5xl xl:text-6xl leading-tight" style={{ color: 'var(--text-1)', fontFamily: '"DM Serif Display",serif', fontStyle: 'italic', letterSpacing: '-0.02em' }}>
          Manage projects with executive clarity.
        </h1>
        <p className="mt-5 text-base leading-relaxed max-w-lg" style={{ color: 'var(--text-3)' }}>
          Access your workspace, projects, assigned tasks, and live analytics in one refined environment.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {['Role-based access', 'Task tracking', 'Live dashboard'].map(item => (
            <div key={item} className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
              <CheckCircle2 className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />
              {item}
            </div>
          ))}
        </div>
      </motion.div>
      <div className="relative rounded-2xl p-5 grid grid-cols-3 gap-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
        {[{ value: 'JWT', label: 'Auth method' }, { value: '2', label: 'User roles' }, { value: '24/pg', label: 'Task limit' }].map(s => (
          <div key={s.label}>
            <p className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Right */}
    <div className="flex flex-1 items-center justify-center p-8" style={{ background: 'var(--surface-1)' }}>
      <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black" style={{ background: 'var(--gold)', color: '#0a0800' }}>TT</div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>TeamTask</span>
        </div>
        <p className="eyebrow mb-3">Get started</p>
        <h2 className="text-3xl mb-1" style={{ color: 'var(--text-1)', fontFamily: '"DM Serif Display",serif', fontStyle: 'italic' }}>{title}</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-3)' }}>{subtitle}</p>
        {children}
      </motion.div>
    </div>
  </div>
);

export const FloatingInput = ({ label, type = 'text', value, onChange, children, showToggle, onToggle, isVisible }) => (
  <div>
    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-3)', letterSpacing: '0.04em' }}>{label}</label>
    {children || (
      <div className="relative">
        <input
          className="form-input"
          style={{ paddingRight: showToggle ? '2.75rem' : undefined }}
          type={showToggle ? (isVisible ? 'text' : 'password') : type}
          required
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: 'var(--text-muted)', lineHeight: 0 }}
            aria-label={isVisible ? 'Hide password' : 'Show password'}
          >
            {isVisible
              ? <EyeOff className="h-4 w-4" style={{ color: 'var(--gold)' }} />
              : <Eye className="h-4 w-4" />
            }
          </button>
        )}
      </div>
    )}
  </div>
);

const Login = () => {
  const { user, login, loading } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const submit = async e => {
    e.preventDefault();
    try { await login(values); navigate('/'); }
    catch (error) { toast.error(apiError(error)); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to access your workspace.">
      <form className="space-y-4" onSubmit={submit}>
        <FloatingInput
          label="Email address"
          type="email"
          value={values.email}
          onChange={email => setValues({ ...values, email })}
        />
        <div>
          <FloatingInput
            label="Password"
            type="password"
            value={values.password}
            onChange={password => setValues({ ...values, password })}
            showToggle
            isVisible={showPassword}
            onToggle={() => setShowPassword(v => !v)}
          />
          {/* Static password hint */}
          <div style={{
            marginTop: '0.5rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '0.6rem',
            background: 'rgba(201,168,76,0.06)',
            border: '1px solid rgba(201,168,76,0.15)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem 0.75rem',
          }}>
            <span style={{ width: '100%', fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.1rem' }}>
              Password must include
            </span>
            {[
              '8+ characters',
              'one Uppercase (A–Z)',
              'one Lowercase (a–z)',
              'Number (0–9)',
              'Symbol (!@#$…)',
            ].map(hint => (
              <span key={hint} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold-dim)', display: 'inline-block', flexShrink: 0 }} />
                {hint}
              </span>
            ))}
          </div>
        </div>
        <button className="btn-primary w-full mt-2" disabled={loading}>
          <LogIn className="h-4 w-4" />
          {loading ? 'Signing in…' : 'Sign in'}
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="text-center text-sm" style={{ color: 'var(--text-3)' }}>
          Need an account?{' '}
          <Link className="font-semibold hover:underline" style={{ color: 'var(--gold-light)' }} to="/signup">Create one</Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Login;