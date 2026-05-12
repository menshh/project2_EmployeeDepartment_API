import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employeesApi } from '../api/services';
import { getApiError } from '../api/http';
import { useAuth } from '../context/AuthContext';
import { dateInput, money } from '../utils/format';
import { EmptyPanel, ErrorPanel, LoadingPanel } from '../components/Feedback';

export default function Employees() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => employeesApi.getAll().then(setItems).catch((e) => setError(getApiError(e))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const remove = async (id) => { if (confirm('Delete this employee?')) { await employeesApi.remove(id); load(); } };

  return (
    <section>
      <header className="pageHeader">
        <div><span className="eyebrow">Employees</span><h1>Team directory</h1></div>
      </header>
      <ErrorPanel text={error} />
      {loading ? <LoadingPanel /> : items.length === 0 ? <EmptyPanel text="No employees found." /> : (
        <div className="employeeMatrix">
          {items.map((e) => (
            <article className="personCard" key={e.id}>
              <div className="avatar">{e.fullName?.slice(0, 2).toUpperCase()}</div>
              <h3>{e.fullName}</h3>
              <p>{e.jobTitle}</p>
              <span>{e.departmentName}</span>
              <dl>
                {isAdmin && <div><dt>Salary</dt><dd>{money(e.salary)}</dd></div>}
                <div><dt>Hire date</dt><dd>{dateInput(e.hireDate)}</dd></div>
              </dl>
              <div className="miniActions">
                {isAdmin && <Link to={`/employees/${e.id}`}>Details</Link>}
                {isAdmin && <button onClick={() => remove(e.id)}>Delete</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
