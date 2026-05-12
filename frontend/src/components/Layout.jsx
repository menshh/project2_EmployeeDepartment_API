import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

function getPendingCount() {
  try {
    const reqs = JSON.parse(localStorage.getItem('employeeRequests')) || [];
    return reqs.filter((r) => r.status === 'pending').length;
  } catch {
    return 0;
  }
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(getPendingCount);

  useEffect(() => {
    const interval = setInterval(() => setPendingCount(getPendingCount()), 2000);
    return () => clearInterval(interval);
  }, []);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand">
          <div className="brandMark">OW</div>
          <div>
            <strong>Orbit Workforce</strong>
            <span>Employee command center</span>
          </div>
        </div>
        <nav className="navStack">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/departments">Departments</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/employees">Employees</NavLink>
          <NavLink to="/employee-requests" style={{ position: 'relative' }}>
            {isAdmin ? 'Employee Requests' : 'Request Employee'}
            {isAdmin && pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: '8px', right: '10px',
                background: '#ff6b6b', color: '#fff', borderRadius: '999px',
                fontSize: '.65rem', fontWeight: 900, padding: '2px 7px', lineHeight: 1.4
              }}>{pendingCount}</span>
            )}
          </NavLink>
        </nav>
        <div className="profileCard">
          <span className="eyebrow">Signed in</span>
          <b>{user?.userName}</b>
          <small>{user?.role}</small>
          <button className="ghostButton" onClick={onLogout}>Logout</button>
        </div>
      </aside>
      <main className="workspace">
        <Outlet />
      </main>
    </div>
  );
}
