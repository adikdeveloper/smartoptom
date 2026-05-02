import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('auth', 'true');
      onLogin();
    } else {
      setError("Login yoki parol noto'g'ri!");
    }
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-main)', padding: 20
    }}>
      <div style={{
        background: 'var(--bg-card)', padding: '40px', borderRadius: '16px',
        boxShadow: 'var(--shadow)', width: '100%', maxWidth: '400px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ 
            width: 60, height: 60, background: 'linear-gradient(135deg, var(--accent), var(--accent-g))',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, color: '#fff', margin: '0 auto 16px',
            boxShadow: '0 4px 20px rgba(14, 165, 233, 0.4)'
          }}>
            S
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>Smartoptom</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Tizimga kirish uchun ma'lumotlarni kiriting</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Login</label>
            <input 
              className="form-control" 
              type="text" 
              placeholder="admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Parol</label>
            <input 
              className="form-control" 
              type="password" 
              placeholder="••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 10, padding: 12, fontSize: 16 }}>
            Kirish
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-3)' }}>
          Standart login: <strong>admin</strong> | parol: <strong>admin123</strong>
        </div>
      </div>
    </div>
  );
}

export default Login;
