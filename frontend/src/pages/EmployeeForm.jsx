import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { departmentsApi, employeesApi, projectsApi } from '../api/services';
import { getApiError } from '../api/http';
import { dateInput } from '../utils/format';
import { TextField, SelectField } from '../components/FormFields';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';

const empty = {
  fullName: '', email: '', jobTitle: '', salary: 0, hireDate: '', departmentId: '', projectIds: [],
  profile: { address: '', phoneNumber: '', dateOfBirth: '', emergencyContactName: '', emergencyContactPhone: '' }
};

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function boot() {
      try {
        const [deps, projs] = await Promise.all([departmentsApi.getAll(), projectsApi.getAll()]);
        setDepartments(deps); setProjects(projs);
        if (isEdit) {
          const emp = await employeesApi.getById(id);
          setForm({
            fullName: emp.fullName, email: emp.email, jobTitle: emp.jobTitle,
            salary: emp.salary, hireDate: dateInput(emp.hireDate),
            departmentId: deps.find((d) => d.name === emp.departmentName)?.id || '',
            projectIds: emp.projects?.map((p) => p.id) || [],
            profile: {
              address: emp.profile?.address || '',
              phoneNumber: emp.profile?.phoneNumber || '',
              dateOfBirth: dateInput(emp.profile?.dateOfBirth),
              emergencyContactName: emp.profile?.emergencyContactName || '',
              emergencyContactPhone: emp.profile?.emergencyContactPhone || ''
            }
          });
        }
      } catch (e) { setError(getApiError(e)); } finally { setLoading(false); }
    }
    boot();
  }, [id, isEdit]);

  const setRoot = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setProfile = (e) => setForm({ ...form, profile: { ...form.profile, [e.target.name]: e.target.value } });
  const toggleProject = (projectId) => setForm((current) => ({
    ...current,
    projectIds: current.projectIds.includes(projectId)
      ? current.projectIds.filter((x) => x !== projectId)
      : [...current.projectIds, projectId]
  }));
  const payload = () => ({
    ...form,
    salary: Number(form.salary),
    departmentId: Number(form.departmentId),
    hireDate: `${form.hireDate}T00:00:00`,
    profile: { ...form.profile, dateOfBirth: `${form.profile.dateOfBirth}T00:00:00` }
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      isEdit ? await employeesApi.update(id, payload()) : await employeesApi.create(payload());
      navigate('/employees');
    } catch (e) { setError(getApiError(e)); }
  };

  if (loading) return <LoadingPanel />;
  return (
    <section>
      <header className="pageHeader">
        <div><span className="eyebrow">{isEdit ? 'Edit employee' : 'New employee'}</span><h1>Employee profile</h1></div>
      </header>
      <ErrorPanel text={error} />
      <form className="cardForm wide" onSubmit={submit}>
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
        <TextField label="Emergency contact" name="emergencyContactName" value={form.profile.emergencyContactName} onChange={setProfile} required />
        <TextField label="Emergency phone" name="emergencyContactPhone" value={form.profile.emergencyContactPhone} onChange={setProfile} required />
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
        <button>{isEdit ? 'Save changes' : 'Create employee'}</button>
      </form>
    </section>
  );
}
