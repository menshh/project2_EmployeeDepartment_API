import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../api/http';

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ fullName: '', userName: '', email: '', password: '', role: 'Admin' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isRegister) await auth.register(form);
      else await auth.login({ userName: form.userName, password: form.password });
      navigate('/');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="authCanvas">
      <section className="authPoster">
        <span className="pill">React + Axios Integration</span>
        <h1>Manage teams, departments, and delivery work from one interface.</h1>
        <p>This frontend reads the JWT from the response headers and sends it automatically with every protected request.</p>
      </section>
      <form className="authBox" onSubmit={submit}>
        <h2>{isRegister ? 'Create account' : 'Welcome back'}</h2>
        <p>{isRegister ? 'Register, then start managing company data.' : ''}</p>
        {error && <div className="notice error">{error}</div>}
        {isRegister && <input name="fullName" placeholder="Full name" value={form.fullName} onChange={update} required />}
        <input name="userName" placeholder="Username" value={form.userName} onChange={update} required />
        {isRegister && <input name="email" type="email" placeholder="Email" value={form.email} onChange={update} required />}
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={update} required minLength={6} />
        {isRegister && (
          <select name="role" value={form.role} onChange={update}>
            <option>Admin</option>
            <option>User</option>
          </select>
        )}
        <button disabled={busy}>{busy ? 'Please wait...' : isRegister ? 'Register' : 'Login'}</button>
        <a href={isRegister ? '/login' : '/register'}>{isRegister ? 'Already have an account?' : 'Create a new account'}</a>
      </form>
    </main>
  );
}
