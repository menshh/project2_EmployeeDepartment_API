import { useEffect, useState } from 'react';
import { projectsApi } from '../api/services';
import { getApiError } from '../api/http';
import { useAuth } from '../context/AuthContext';
import { dateInput, money } from '../utils/format';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';
import { TextArea, TextField } from '../components/FormFields';

const blank = { name: '', description: '', budget: 0, startDate: '', endDate: '' };

function statusLabel(p) {
  const now = new Date();
  if (new Date(p.endDate) < now) return { label: 'Completed', color: '#89f0c1' };
  if (new Date(p.startDate) > now) return { label: 'Upcoming', color: '#2d8cff' };
  return { label: 'Active', color: '#f0c589' };
}

function durationDays(p) {
  const diff = new Date(p.endDate) - new Date(p.startDate);
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function StatusBadge({ p }) {
  const st = statusLabel(p);
  return (
    <span style={{
      fontSize: '.7rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
      color: st.color, border: `1px solid ${st.color}`, borderRadius: '999px', padding: '3px 10px'
    }}>{st.label}</span>
  );
}

export default function Projects() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    projectsApi.getAll()
      .then((data) => {
        setItems(data);
        // keep selected in sync after reload
        if (selected) {
          const refreshed = data.find((p) => p.id === selected.id);
          setSelected(refreshed || null);
        }
      })
      .catch((e) => setError(getApiError(e)))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const payload = () => ({
    ...form,
    budget: Number(form.budget),
    startDate: `${form.startDate}T00:00:00`,
    endDate: `${form.endDate}T00:00:00`
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      editing ? await projectsApi.update(editing, payload()) : await projectsApi.create(payload());
      setForm(blank);
      setEditing(null);
      load();
    } catch (e) { setError(getApiError(e)); }
  };

  const edit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, description: p.description, budget: p.budget, startDate: dateInput(p.startDate), endDate: dateInput(p.endDate) });
    setSelected(null);
  };

  const remove = async (id) => {
    if (confirm('Delete this project?')) {
      await projectsApi.remove(id);
      if (selected?.id === id) setSelected(null);
      load();
    }
  };

  const openDetails = (p) => setSelected(selected?.id === p.id ? null : p);

  return (
    <section>
      <header className="pageHeader">
        <div><span className="eyebrow">Projects</span><h1>Projects</h1></div>
      </header>
      <ErrorPanel text={error} />

      {isAdmin && (
        <form className="cardForm" onSubmit={submit}>
          <TextField label="Name" name="name" value={form.name} onChange={update} required />
          <TextField label="Budget" name="budget" type="number" value={form.budget} onChange={update} min="0" />
          <TextField label="Start" name="startDate" type="date" value={form.startDate} onChange={update} required />
          <TextField label="End" name="endDate" type="date" value={form.endDate} onChange={update} required />
          <TextArea label="Description" name="description" value={form.description} onChange={update} required minLength="5" />
          <button>{editing ? 'Update project' : 'Create project'}</button>
        </form>
      )}

      {loading ? <LoadingPanel /> : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 390px' : '1fr', gap: '18px', alignItems: 'start' }}>

          {/* List */}
          <div className="listBoard">
            {items.length === 0 && <div className="notice empty">No projects yet.</div>}
            {items.map((p) => (
              <article
                className="rowCard"
                key={p.id}
                style={{ cursor: 'pointer', outline: selected?.id === p.id ? '2px solid #89f0c1' : 'none', outlineOffset: '2px' }}
              >
                <div onClick={() => openDetails(p)}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {p.name} <StatusBadge p={p} />
                  </h3>
                  <p>{p.description}</p>
                  <span style={{ display: 'block', color: '#9aa6b8', marginTop: '4px', fontSize: '.85rem' }}>
                    {dateInput(p.startDate)} → {dateInput(p.endDate)}
                  </span>
                </div>
                <div onClick={() => openDetails(p)} style={{ textAlign: 'right' }}>
                  {isAdmin && <b>{money(p.budget)}</b>}
                </div>
                {isAdmin ? (
                  <div className="miniActions">
                    <button onClick={(e) => { e.stopPropagation(); edit(p); }}>Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); remove(p.id); }}>Delete</button>
                  </div>
                ) : <div />}
              </article>
            ))}
          </div>

          {/* Details panel */}
          {selected && (
            <aside style={{
              background: '#1b202b', border: '1px solid #2e3748', borderRadius: '28px',
              padding: '28px', position: 'sticky', top: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <span className="eyebrow">Project Details</span>
                <button
                  className="ghostButton"
                  style={{ padding: '6px 12px', fontSize: '.8rem' }}
                  onClick={() => setSelected(null)}
                >✕ Close</button>
              </div>

              <h2 style={{ margin: '0 0 12px', fontSize: '1.55rem', lineHeight: 1.2 }}>{selected.name}</h2>
              <StatusBadge p={selected} />

              <p style={{ color: '#aeb8c9', marginTop: '18px', lineHeight: 1.65, marginBottom: '20px' }}>
                {selected.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {[
                  ...(isAdmin ? [{ label: 'Budget', value: money(selected.budget) }] : []),
                  { label: 'Duration', value: `${durationDays(selected)} days` },
                  { label: 'Start Date', value: dateInput(selected.startDate) },
                  { label: 'End Date', value: dateInput(selected.endDate) },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    background: '#141820', border: '1px solid #2e3748',
                    borderRadius: '16px', padding: '14px'
                  }}>
                    <div style={{ fontSize: '.72rem', color: '#9aa6b8', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>
                      {label}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{value}</div>
                  </div>
                ))}
              </div>

              {isAdmin && (
                <div className="miniActions">
                  <button onClick={() => edit(selected)}>Edit project</button>
                  <button onClick={() => remove(selected.id)}>Delete</button>
                </div>
              )}
            </aside>
          )}
        </div>
      )}
    </section>
  );
}
