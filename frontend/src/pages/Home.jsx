import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { departmentsApi, employeesApi, projectsApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ departments: 0, projects: 0, employees: 0 });

  useEffect(() => {
    Promise.all([departmentsApi.getAll(), projectsApi.getAll(), employeesApi.getAll()])
      .then(([departments, projects, employees]) =>
        setStats({ departments: departments.length, projects: projects.length, employees: employees.length })
      )
      .catch(() => {});
  }, []);

  return (
    <section className="pageGrid">
      <div className="heroBlock">
        <span className="eyebrow">Backend connected</span>
        <h1>Hello, {user?.userName}. Your workforce API is live.</h1>
        <p>Use this dashboard to create departments, register projects, assign employees, and test the full CRUD flow required by the assignment.</p>
        <div className="actionRow">
          <Link className="primaryLink" to="/employees">View employees</Link>
          <Link className="secondaryLink" to="/departments">View departments</Link>
        </div>
      </div>
      <div className="metricWall">
        <article><span>{stats.departments}</span><p>Departments</p></article>
        <article><span>{stats.projects}</span><p>Projects</p></article>
        <article><span>{stats.employees}</span><p>Employees</p></article>
      </div>
    </section>
  );
}
