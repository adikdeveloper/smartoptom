import { useState } from 'react';

const CREDENTIALS_KEY = 'crm_credentials';

function getCredentials() {
  const stored = localStorage.getItem(CREDENTIALS_KEY);
  if (stored) return JSON.parse(stored);
  return { username: 'admin', password: 'admin123' };
}

export default function Profile() {
  const creds = getCredentials();
  const [activeTab, setActiveTab] = useState('info');

  // Parol o'zgartirish
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState(null); // { type: 'success'|'error', text }

  // Login o'zgartirish
  const [newUsername, setNewUsername] = useState('');
  const [loginMsg, setLoginMsg] = useState(null);

  const handleChangePassword = (e) => {
    e.preventDefault();
    const current = getCredentials();
    if (oldPass !== current.password) {
      setPassMsg({ type: 'error', text: "Joriy parol noto'g'ri!" });
      return;
    }
    if (newPass.length < 4) {
      setPassMsg({ type: 'error', text: 'Yangi parol kamida 4 ta belgi bo\'lishi kerak!' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'Yangi parollar mos kelmayapti!' });
      return;
    }
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ ...current, password: newPass }));
    setPassMsg({ type: 'success', text: '✅ Parol muvaffaqiyatli o\'zgartirildi!' });
    setOldPass(''); setNewPass(''); setConfirmPass('');
  };

  const handleChangeUsername = (e) => {
    e.preventDefault();
    if (newUsername.trim().length < 3) {
      setLoginMsg({ type: 'error', text: 'Login kamida 3 ta belgi bo\'lishi kerak!' });
      return;
    }
    const current = getCredentials();
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ ...current, username: newUsername.trim() }));
    setLoginMsg({ type: 'success', text: `✅ Login "${newUsername.trim()}" ga o'zgartirildi!` });
    setNewUsername('');
    window.location.reload();
  };

  const tabs = [
    { id: 'info', label: '👤 Ma\'lumotlar' },
    { id: 'password', label: '🔑 Parol' },
    { id: 'system', label: '⚙️ Tizim' },
  ];

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header card */}
      <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-g) 100%)',
          padding: '32px 32px 20px',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 800, color: '#fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}>
              {creds.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                {creds.username}
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.2)', borderRadius: 20,
                padding: '3px 12px', fontSize: 12, color: '#fff', fontWeight: 600,
              }}>
                🛡️ Administrator
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 16px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-3)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== INFO TAB ===== */}
      {activeTab === 'info' && (
        <div className="card">
          <h3 style={{ marginBottom: 20, color: 'var(--text-1)', fontSize: 16 }}>Profil Ma'lumotlari</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InfoRow label="👤 Foydalanuvchi nomi" value={creds.username} />
            <InfoRow label="🛡️ Rol" value="Administrator" />
            <InfoRow label="🔒 Tizim" value="Smartoptom CRM" />
            <InfoRow label="📅 Kirish vaqti" value={new Date().toLocaleString('uz-UZ')} />
          </div>

          <div style={{ marginTop: 28 }}>
            <h4 style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 12 }}>Login o'zgartirish</h4>
            <form onSubmit={handleChangeUsername} style={{ display: 'flex', gap: 10 }}>
              <input
                className="form-control"
                type="text"
                placeholder="Yangi login nomi"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                O'zgartirish
              </button>
            </form>
            {loginMsg && (
              <div style={{
                marginTop: 10, padding: '8px 14px', borderRadius: 8, fontSize: 13,
                background: loginMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: loginMsg.type === 'success' ? '#22c55e' : '#ef4444',
                border: `1px solid ${loginMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
                {loginMsg.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== PASSWORD TAB ===== */}
      {activeTab === 'password' && (
        <div className="card">
          <h3 style={{ marginBottom: 6, color: 'var(--text-1)', fontSize: 16 }}>Parol O'zgartirish</h3>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 24 }}>
            Xavfsizlik uchun parolingizni muntazam yangilab turing.
          </p>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Joriy parol</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={oldPass} onChange={e => setOldPass(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Yangi parol</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={newPass} onChange={e => setNewPass(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Yangi parolni tasdiqlang</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
            </div>

            {passMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 13,
                background: passMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: passMsg.type === 'success' ? '#22c55e' : '#ef4444',
                border: `1px solid ${passMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
                {passMsg.text}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
              🔑 Parolni saqlash
            </button>
          </form>
        </div>
      )}

      {/* ===== SYSTEM TAB ===== */}
      {activeTab === 'system' && (
        <div className="card">
          <h3 style={{ marginBottom: 20, color: 'var(--text-1)', fontSize: 16 }}>Tizim Ma'lumotlari</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InfoRow label="📦 Dastur nomi" value="Smartoptom CRM" />
            <InfoRow label="🔖 Versiya" value="v1.0.0" />
            <InfoRow label="🖥️ Frontend" value="React + Vite" />
            <InfoRow label="⚙️ Backend" value="Node.js + Express" />
            <InfoRow label="🗄️ Ma'lumotlar bazasi" value="MongoDB Atlas" />
            <InfoRow label="☁️ Hosting" value="Vercel (Frontend) / Render (Backend)" />
            <InfoRow label="👨‍💻 Ishlab chiquvchi" value="adikdeveloper" />
          </div>

          <div style={{
            marginTop: 24, padding: '14px 16px', borderRadius: 10,
            background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)',
            fontSize: 12, color: 'var(--text-3)', textAlign: 'center',
          }}>
            © 2025 Smartoptom CRM — Barcha huquqlar himoyalangan
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
