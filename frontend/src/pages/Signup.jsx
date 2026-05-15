import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../utils/format';
import { AuthShell, FloatingInput } from './Login';

const Signup = () => {
  const { user, register, loading } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', password: '', role: 'Member' });
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
        <FloatingInput label="Password" type="password" value={values.password} onChange={(password) => setValues({ ...values, password })} />

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