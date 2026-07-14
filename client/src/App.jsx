import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

function App() {
  return (
    <Routes>
      <Route path="/"        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin"   element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/login"   element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*"        element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default App;
