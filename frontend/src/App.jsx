import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import EmployeeDetails from './pages/employees/EmployeeDetails.jsx';
import EmployeeForm from './pages/employees/EmployeeForm.jsx';
import EmployeeList from './pages/employees/EmployeeList.jsx';
import TaskDetails from './pages/tasks/TaskDetails.jsx';
import TaskForm from './pages/tasks/TaskForm.jsx';
import TaskList from './pages/tasks/TaskList.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/new" element={<EmployeeForm />} />
        <Route path="employees/:id" element={<EmployeeDetails />} />
        <Route path="employees/:id/edit" element={<EmployeeForm />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="tasks/new" element={<TaskForm />} />
        <Route path="tasks/:id" element={<TaskDetails />} />
        <Route path="tasks/:id/edit" element={<TaskForm />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
