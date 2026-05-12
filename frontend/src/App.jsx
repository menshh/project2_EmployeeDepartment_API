import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import Departments from './pages/Departments';
import Projects from './pages/Projects';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeRequests from './pages/EmployeeRequests';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="departments" element={<Departments />} />
            <Route path="projects" element={<Projects />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/new" element={<ProtectedRoute adminOnly><EmployeeForm /></ProtectedRoute>} />
            <Route path="employees/:id" element={<ProtectedRoute adminOnly><EmployeeForm /></ProtectedRoute>} />
            <Route path="employee-requests" element={<EmployeeRequests />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
