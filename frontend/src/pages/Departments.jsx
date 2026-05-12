import { useEffect, useState } from 'react';
import { departmentsApi } from '../api/services';
import { getApiError } from '../api/http';
import { useAuth } from '../context/AuthContext';
import { EmptyPanel, ErrorPanel, LoadingPanel } from '../components/Feedback';

export default function Departments() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', location: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => departmentsApi.getAll().then(setItems).catch((e) => setError(getApiError(e))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      editing ? await departmentsApi.update(editing, form) : await departmentsApi.create(form);
      setForm({ name: '', location: '' });
      setEditing(null);
      load();
    } catch (e) { setError(getApiError(e)); }
  };

  const edit = (item) => { setEditing(item.id); setForm({ name: item.name, location: item.location }); };
  const remove = async (id) => { if (confirm('Delete this department?')) { await departmentsApi.remove(id); load(); } };

  return (
    <section>
      <header className="pageHeader"><div><span className="eyebrow">Departments</span><h1>Department locations</h1></div></header>
      <ErrorPanel text={error} />
      {isAdmin && <form className="inlineEditor" onSubmit={submit}>
        <input placeholder="Department name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        <button>{editing ? 'Update' : 'Add'}</button>
      </form>}
      {loading ? <LoadingPanel /> : items.length === 0 ? <EmptyPanel text="No departments yet." /> : (
        <div className="tileGrid">{items.map((d) => <article className="dataTile" key={d.id}>
          <h3>{d.name}</h3><p>{d.location}</p><span>{d.employeesCount} employees</span>
          {isAdmin && <div className="miniActions"><button onClick={() => edit(d)}>Edit</button><button onClick={() => remove(d.id)}>Delete</button></div>}
        </article>)}</div>
      )}
    </section>
  );
}
