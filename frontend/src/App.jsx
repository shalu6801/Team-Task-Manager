import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Signup from './pages/Signup';
import Tasks from './pages/Tasks';
import Users from './pages/Users';

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="profile" element={<Profile />} />
        <Route element={<ProtectedRoute roles={['Admin']} />}>
          <Route path="users" element={<Users />} />
        </Route>
      </Route>
    </Route>
    <Route path="/404" element={<NotFound />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes>
);

export default App;
