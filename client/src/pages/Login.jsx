import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('sat_token', response.data.token);
      localStorage.setItem('sat_user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login.');
    }
  };

  return (
    <div className="page-card">
      <h1 className="page-title">Login</h1>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign in</button>
      </form>
      <p style={{ marginTop: '16px' }}>
        New user? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}

export default Login;
