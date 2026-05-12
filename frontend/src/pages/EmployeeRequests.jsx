import { useEffect, useState } from 'react';
import { departmentsApi, employeesApi, projectsApi } from '../api/services';
import { getApiError } from '../api/http';
import { useAuth } from '../context/AuthContext';
import { dateInput } from '../utils/format';
import { TextField, SelectField } from '../components/FormFields';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';

const STORAGE_KEY = 'employeeRequests';

const emptyForm = {
  fullName: '', email: '', jobTitle: '', salary: 0, hireDate: '', departmentId: '', projectIds: [],
  profile: {
    address: '', phoneNumber: '', dateOfBirth: '',
    emergencyContactName: '', emergencyContactPhone: ''
  }
};

function loadRequests() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveRequests(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function StatusBadge({ status }) {
  const colors = { pending: '#f0c589', approved: '#89f0c1', rejected: '#ff6b6b' };
  const c = colors[status] || '#9aa6b8';
  return (
    <span style={{
      fontSize: '.7rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
      color: c, border: `1px solid ${c}`, borderRadius: '999px', padding: '3px 10px'
    }}>{status}</span>
  );
}

export default function EmployeeRequests() {
  const { isAdmin, user } = useAuth();
  const [requests, setRequests] = useState(loadRequests);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [booting, setBooting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(isAdmin ? 'pending' : 'new');

  useEffect(() => {
    Promise.all([departmentsApi.getAll(), projectsApi.getAll()])
      .then(([deps, projs]) => { setDepartments(deps); setProjects(projs); })
      .catch((e) => setError(getApiError(e)))
      .finally(() => setBooting(false));
  }, []);

  const refreshRequests = () => setRequests(loadRequests());

  const setRoot = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setProfile = (e) => setForm({ ...form, profile: { ...form.profile, [e.target.name]: e.target.value } });
  const toggleProject = (pid) => setForm((f) => ({
    ...f,
    projectIds: f.projectIds.includes(pid)
      ? f.projectIds.filter((x) => x !== pid)
      : [...f.projectIds, pid]
  }));

  const submitRequest = (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const req = {
      id: Date.now(),
      submittedBy: user?.userName || 'Unknown',
      submittedAt: new Date().toISOString(),
      status: 'pending',
      data: {
        ...form,
        salary: Number(form.salary),
        departmentId: Number(form.departmentId),
        hireDate: `${form.hireDate}T00:00:00`,
        profile: { ...form.profile, dateOfBirth: `${form.profile.dateOfBirth}T00:00:00` }
      },
      departmentName: departments.find((d) => d.id === Number(form.departmentId))?.name || '',
      projectNames: projects.filter((p) => form.projectIds.includes(p.id)).map((p) => p.name),
    };
    const updated = [req, ...loadRequests()];
    saveRequests(updated);
    setRequests(updated);
    setForm(emptyForm);
    setSuccess('Your request has been submitted and is awaiting admin approval.');
    setActiveTab('mine');
  };

  const approve = async (req) => {
    setError(''); setSubmitting(true);
    try {
      await employeesApi.create(req.data);
      const updated = loadRequests().map((r) =>
        r.id === req.id ? { ...r, status: 'approved', resolvedAt: new Date().toISOString() } : r
      );
      saveRequests(updated); setRequests(updated);
    } catch (e) { setError(getApiError(e)); }
    finally { setSubmitting(false); }
  };

  const reject = (req) => {
    const updated = loadRequests().map((r) =>
      r.id === req.id ? { ...r, status: 'rejected', resolvedAt: new Date().toISOString() } : r
    );
    saveRequests(updated); setRequests(updated);
  };

  const myRequests = requests.filter((r) => r.submittedBy === user?.userName);
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const tabs = [
    { key: 'new', label: '＋ New Request' },
    { key: 'mine', label: `My Requests (${myRequests.length})` },
    ...(isAdmin ? [
      { key: 'pending', label: 'Pending', badge: pendingRequests.length },
      { key: 'all', label: `All (${requests.length})` },
    ] : []),
  ];

  if (booting) return <LoadingPanel />;

  return (
    <section>
      <header className="pageHeader">
        <div>
          <span className="eyebrow">Employee Requests</span>
          <h1>{isAdmin ? 'Recommendation Requests' : 'Recommend a new employee'}</h1>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setSuccess(''); setError(''); }}
            style={{
              position: 'relative',
              background: activeTab === t.key ? '#89f0c1' : 'transparent',
              color: activeTab === t.key ? '#10131a' : '#dce6f7',
              border: `1px solid ${activeTab === t.key ? '#89f0c1' : '#465265'}`,
              borderRadius: '14px', padding: '10px 18px',
              fontWeight: activeTab === t.key ? 900 : 600,
            }}
          >
            {t.label}
            {t.badge > 0 && activeTab !== t.key && (
              <span style={{
                position: 'absolute', top: '-7px', right: '-7px',
                background: '#ff6b6b', color: '#fff', borderRadius: '999px',
                fontSize: '.65rem', fontWeight: 900, padding: '2px 6px', lineHeight: 1.4
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      <ErrorPanel text={error} />
      {success && (
        <div className="notice" style={{ marginBottom: '18px', color: '#89f0c1', background: '#1a2e24', borderColor: '#2a6048' }}>
          {success}
        </div>
      )}

      {/* New Request Form */}
      {activeTab === 'new' && (
        <form className="cardForm wide" onSubmit={submitRequest}>
          <TextField label="Full name" name="fullName" value={form.fullName} onChange={setRoot} required />
          <TextField label="Email" name="email" type="email" value={form.email} onChange={setRoot} required />
          <TextField label="Job title" name="jobTitle" value={form.jobTitle} onChange={setRoot} required />
          <TextField label="Salary" name="salary" type="number" value={form.salary} onChange={setRoot} min="0" />
          <TextField label="Hire date" name="hireDate" type="date" value={form.hireDate} onChange={setRoot} required />
          <SelectField label="Department" name="departmentId" value={form.departmentId} onChange={setRoot} required>
            <option value="">Choose department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </SelectField>
          <TextField label="Address" name="address" value={form.profile.address} onChange={setProfile} required />
          <TextField label="Phone" name="phoneNumber" value={form.profile.phoneNumber} onChange={setProfile} required />
          <TextField label="Date of birth" name="dateOfBirth" type="date" value={form.profile.dateOfBirth} onChange={setProfile} required />
          <TextField label="Emergency contact name" name="emergencyContactName" value={form.profile.emergencyContactName} onChange={setProfile} required />
          <TextField label="Emergency contact phone" name="emergencyContactPhone" value={form.profile.emergencyContactPhone} onChange={setProfile} required />
          <div className="field full">
            <span>Projects</span>
            <div className="checkCloud">
              {projects.map((p) => (
                <label key={p.id}>
                  <input type="checkbox" checked={form.projectIds.includes(p.id)} onChange={() => toggleProject(p.id)} /> {p.name}
                </label>
              ))}
            </div>
          </div>
          <button style={{ gridColumn: '1 / -1' }}>Submit request for admin approval</button>
        </form>
      )}

      {/* My Requests */}
      {activeTab === 'mine' && (
        <div className="listBoard">
          {myRequests.length === 0
            ? <div className="notice empty">You haven't submitted any requests yet.</div>
            : myRequests.map((r) => (
              <article className="rowCard" key={r.id}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {r.data.fullName} <StatusBadge status={r.status} />
                  </h3>
                  <p>{r.data.jobTitle} · {r.departmentName}</p>
                  <span style={{ display: 'block', color: '#9aa6b8', fontSize: '.83rem', marginTop: '4px' }}>
                    Submitted {new Date(r.submittedAt).toLocaleString()}
                    {r.resolvedAt && ` · Resolved ${new Date(r.resolvedAt).toLocaleString()}`}
                  </span>
                </div>
                <div /><div />
              </article>
            ))}
        </div>
      )}

      {/* Pending (admin) */}
      {isAdmin && activeTab === 'pending' && (
        <div className="listBoard">
          {pendingRequests.length === 0
            ? <div className="notice empty">No pending requests — you're all caught up.</div>
            : pendingRequests.map((r) => (
              <article className="rowCard" key={r.id}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {r.data.fullName} <StatusBadge status={r.status} />
                  </h3>
                  <p style={{ margin: '4px 0' }}>{r.data.jobTitle} · {r.departmentName} · {r.data.email}</p>
                  <p style={{ color: '#aeb8c9', margin: '2px 0', fontSize: '.85rem' }}>
                    Hire: {dateInput(r.data.hireDate)}
                    {r.projectNames.length > 0 && ` · Projects: ${r.projectNames.join(', ')}`}
                  </p>
                  <span style={{ display: 'block', color: '#9aa6b8', fontSize: '.82rem', marginTop: '4px' }}>
                    Requested by <b style={{ color: '#ccd7e7' }}>{r.submittedBy}</b> on {new Date(r.submittedAt).toLocaleString()}
                  </span>
                </div>
                <div />
                <div className="miniActions">
                  <button
                    onClick={() => approve(r)}
                    disabled={submitting}
                    style={{ background: '#89f0c1', color: '#10131a', border: 'none', borderRadius: '12px', padding: '10px 16px', fontWeight: 900 }}
                  >
                    {submitting ? '…' : '✓ Approve'}
                  </button>
                  <button
                    onClick={() => reject(r)}
                    style={{ background: 'transparent', border: '1px solid #7b3444', color: '#ffd8df', borderRadius: '12px', padding: '10px 16px' }}
                  >
                    ✕ Reject
                  </button>
                </div>
              </article>
            ))}
        </div>
      )}

      {/* All Requests (admin) */}
      {isAdmin && activeTab === 'all' && (
        <div className="listBoard">
          {requests.length === 0
            ? <div className="notice empty">No requests have been submitted yet.</div>
            : requests.map((r) => (
              <article className="rowCard" key={r.id}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {r.data.fullName} <StatusBadge status={r.status} />
                  </h3>
                  <p style={{ margin: '4px 0' }}>{r.data.jobTitle} · {r.departmentName}</p>
                  <span style={{ display: 'block', color: '#9aa6b8', fontSize: '.82rem', marginTop: '4px' }}>
                    By <b style={{ color: '#ccd7e7' }}>{r.submittedBy}</b> · {new Date(r.submittedAt).toLocaleString()}
                    {r.resolvedAt && ` · Resolved ${new Date(r.resolvedAt).toLocaleString()}`}
                  </span>
                </div>
                <div />
                {r.status === 'pending' ? (
                  <div className="miniActions">
                    <button
                      onClick={() => approve(r)}
                      disabled={submitting}
                      style={{ background: '#89f0c1', color: '#10131a', border: 'none', borderRadius: '12px', padding: '10px 16px', fontWeight: 900 }}
                    >
                      {submitting ? '…' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => reject(r)}
                      style={{ background: 'transparent', border: '1px solid #7b3444', color: '#ffd8df', borderRadius: '12px', padding: '10px 16px' }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                ) : <div />}
              </article>
            ))}
        </div>
      )}
    </section>
  );
}
