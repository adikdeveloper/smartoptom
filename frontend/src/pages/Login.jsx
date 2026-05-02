import React, { useState } from 'react';
import logoImg from '../assets/logo.png';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const stored = localStorage.getItem('crm_credentials');
    const creds = stored ? JSON.parse(stored) : { username: 'admin', password: 'admin123' };
    if (username === creds.username && password === creds.password) {
      localStorage.setItem('auth', 'true');
      onLogin();
    } else {
      setError("Login yoki parol noto'g'ri!");
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
        animation: 'pulse 5s ease-in-out infinite reverse',
      }} />
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.1);opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Left side — branding */}
      <div style={{
        flex: 1, display: 'none', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 40,
      }} className="login-left">
      </div>

      {/* Center card */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: '40px 36px',
          width: '100%', maxWidth: 420,
          boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 40px rgba(14,165,233,0.08)',
          animation: 'slideUp 0.5s ease',
        }}>
          {/* Logo + Tizim nomi */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 14, marginBottom: 16,
            }}>
              <img
                src={logoImg}
                alt="Smartoptom"
                style={{
                  width: 54, height: 54, borderRadius: 14,
                  objectFit: 'cover',
                  boxShadow: '0 4px 20px rgba(14,165,233,0.4)',
                  border: '2px solid rgba(14,165,233,0.3)',
                }}
              />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
                  Smartoptom
                </div>
                <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.9)', marginTop: 2 }}>
                  Boshqaruv Tizimi
                </div>
              </div>
            </div>
            <div style={{
              width: '60%', height: 1, background: 'rgba(255,255,255,0.08)',
              margin: '0 auto 20px',
            }} />
            <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: 14 }}>
              Davom etish uchun tizimga kiring
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(148,163,184,0.9)' }}>
                👤 Foydalanuvchi nomi
              </label>
              <input
                type="text"
                placeholder="Login kiriting"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                style={{
                  padding: '12px 16px', borderRadius: 10, fontSize: 14,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(14,165,233,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(148,163,184,0.9)' }}>
                🔑 Parol
              </label>
              <input
                type="password"
                placeholder="Parol kiriting"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  padding: '12px 16px', borderRadius: 10, fontSize: 14,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(14,165,233,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', textAlign: 'center',
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                marginTop: 8, padding: '14px', borderRadius: 12,
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: '#fff', fontWeight: 700, fontSize: 15,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(14,165,233,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Tizimga kirish →
            </button>
          </form>

          <div style={{
            marginTop: 28, textAlign: 'center',
            fontSize: 12, color: 'rgba(100,116,139,0.8)',
          }}>
            © 2026 Smartoptom CRM
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
