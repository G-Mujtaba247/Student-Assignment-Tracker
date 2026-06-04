import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('sat_token', response.data.token);
      localStorage.setItem('sat_user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register.');
    }
  };

  return (
    <div className="page-card">
      <h1 className="page-title">Register</h1>
      <p className="subtitle">Create your account and start assigning tasks, tracking progress, and staying organized.</p>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
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
        <button type="submit">Create account</button>
      </form>
      <p style={{ marginTop: '16px' }}>
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

export default Register;
