import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('sat_user') || 'null');
  const token = localStorage.getItem('sat_token');
  if (!token || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default AdminRoute;
