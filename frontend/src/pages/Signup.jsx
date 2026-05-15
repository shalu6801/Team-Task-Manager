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

  const submit = async (event) => {
    event.preventDefault();
    try {
      await register(values);
      navigate('/');
    } catch (error) {
      toast.error(apiError(error));
    }
  };

  return (
    <AuthShell title="Create account" subtitle="The first registered user automatically becomes an admin.">
      <form className="space-y-5" onSubmit={submit}>
        <FloatingInput label="Name" value={values.name} onChange={(name) => setValues({ ...values, name })} />
        <FloatingInput label="Email" type="email" value={values.email} onChange={(email) => setValues({ ...values, email })} />
        <FloatingInput label="Password" type="password" value={values.password} onChange={(password) => setValues({ ...values, password })} />
        <FloatingInput label="Role">
          <select className="form-input" value={values.role} onChange={(event) => setValues({ ...values, role: event.target.value })}>
            <option>Member</option>
            <option>Admin</option>
          </select>
        </FloatingInput>
        <button className="btn-primary w-full" disabled={loading}>
          <UserPlus className="h-4 w-4" />
          {loading ? 'Creating...' : 'Create account'}
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="text-center text-sm font-medium text-slate-400">
          Already registered? <Link className="font-black text-violet-200 hover:text-white" to="/login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Signup;
