import { useState, useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, UserPlus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../utils/format';
import { AuthShell, FloatingInput } from './Login';

/* ── Password strength checker ─────────────────────────── */
const rules = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
  { label: 'One number (0–9)', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const strengthLabel = (passed) => {
  if (passed === 0) return null;
  if (passed <= 2) return { text: 'Weak', color: 'var(--rose)' };
  if (passed <= 3) return { text: 'Fair', color: 'var(--amber)' };
  if (passed === 4) return { text: 'Good', color: 'var(--teal)' };
  return { text: 'Strong', color: 'var(--emerald)' };
};

const PasswordRules = ({ password }) => {
  const results = useMemo(() => rules.map((r) => ({ ...r, passed: password ? r.test(password) : false })), [password]);
  const passedCount = results.filter((r) => r.passed).length;
  const strength = password ? strengthLabel(passedCount) : null;

  return (
    <div
      className="rounded-xl p-3 space-y-2"
      style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}
    >
      {/* Strength bar */}
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>
          Password must include
        </span>
        {strength && (
          <span style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: "'DM Mono', monospace", color: strength.color }}>
            {strength.text}
          </span>
        )}
      </div>
      {password && (
        <div style={{ display: 'flex', gap: '3px', marginBottom: '0.5rem' }}>
          {rules.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '99px',
                background: i < passedCount ? (strength?.color || 'var(--gold)') : 'var(--ink-border-light)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Rule checklist */}
      {results.map((rule) => (
        <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              flexShrink: 0,
              background: rule.passed ? 'var(--emerald-dim)' : 'var(--ink-border)',
              border: `1px solid ${rule.passed ? 'rgba(82,196,122,0.3)' : 'transparent'}`,
              transition: 'all 0.2s ease',
            }}
          >
            {rule.passed
              ? <Check style={{ width: '9px', height: '9px', color: 'var(--emerald)', strokeWidth: 3 }} />
              : <X style={{ width: '9px', height: '9px', color: 'var(--text-muted)', strokeWidth: 3 }} />
            }
          </span>
          <span style={{ fontSize: '0.75rem', color: rule.passed ? 'var(--text-secondary)' : 'var(--text-muted)', transition: 'color 0.2s ease' }}>
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const Signup = () => {
  const { user, register, loading } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(values);
      navigate('/');
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="The first registered user becomes an admin automatically."
      mode="signup"
    >
      <form className="space-y-5" onSubmit={submit}>
        <FloatingInput label="Full name" value={values.name} onChange={(name) => setValues({ ...values, name })} />
        <FloatingInput label="Email address" type="email" value={values.email} onChange={(email) => setValues({ ...values, email })} />

        {/* Password with eye toggle */}
        <div>
          <FloatingInput
            label="Password"
            type="password"
            value={values.password}
            onChange={(password) => setValues({ ...values, password })}
            showToggle
            isVisible={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
          />
          {/* Inline strength indicator */}
          <div style={{ marginTop: '0.5rem' }}>
            <PasswordRules password={values.password} />
          </div>
        </div>

        <FloatingInput label="Role">
          <select
            className="form-input"
            value={values.role}
            onChange={(e) => setValues({ ...values, role: e.target.value })}
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
        </FloatingInput>

        <div style={{ paddingTop: '0.5rem' }}>
          <button className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            <UserPlus className="h-4 w-4" />
            {loading ? 'Creating…' : 'Create account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--ink-border)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--ink-border)' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--gold-light)', fontWeight: 600, textDecoration: 'none' }}
            onMouseOver={e => e.target.style.color = 'var(--gold)'}
            onMouseOut={e => e.target.style.color = 'var(--gold-light)'}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Signup;