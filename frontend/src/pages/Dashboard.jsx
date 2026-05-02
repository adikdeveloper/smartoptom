import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';

const chartData = [
  { name: 'Yan', kirim: 4200000, chiqim: 1800000 },
  { name: 'Fev', kirim: 5100000, chiqim: 2100000 },
  { name: 'Mar', kirim: 3900000, chiqim: 1600000 },
  { name: 'Apr', kirim: 6200000, chiqim: 2400000 },
  { name: 'May', kirim: 5500000, chiqim: 2000000 },
  { name: 'Iyn', kirim: 7100000, chiqim: 2700000 },
];

function fmt(n) {
  return new Intl.NumberFormat('uz-UZ').format(n) + ' so\'m';
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /> Yuklanmoqda...</div>;

  // Welcome xabari
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 6)  return { emoji: '🌙', text: 'Xayrli tun' };
    if (h < 12) return { emoji: '🌅', text: 'Xayrli tong' };
    if (h < 17) return { emoji: '☀️',  text: 'Xayrli kun' };
    if (h < 21) return { emoji: '🌆', text: 'Xayrli kechqurun' };
    return { emoji: '🌙', text: 'Xayrli oqshom' };
  };
  const greeting = getGreeting();
  const stored = localStorage.getItem('crm_credentials');
  const username = stored ? JSON.parse(stored).username : 'Admin';
  const today = new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      {/* ===== Welcome Banner ===== */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-g) 100%)',
        borderRadius: 16, padding: '20px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        boxShadow: '0 4px 24px rgba(14,165,233,0.25)',
        animation: 'slideIn 0.4s ease',
      }}>
        <style>{`@keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }`}</style>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
            Xush kelibsiz, <span style={{ textTransform: 'capitalize' }}>{username}</span>. Ish kuningiz unumli o'tsin.
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
            🟢 Smartoptom boshqaruv tizimi ishlashga tayyor.
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)', borderRadius: 10,
          padding: '8px 16px', fontSize: 12, color: '#fff', fontWeight: 600,
          backdropFilter: 'blur(4px)',
        }}>
          📅 {today}
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue">👥</div>
          <div className="stat-info">
            <p>Jami Mijozlar</p>
            <h3>{stats?.totalCustomers ?? 0}</h3>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">💰</div>
          <div className="stat-info">
            <p>Oylik Kirim</p>
            <h3>{fmt(stats?.monthIncome ?? 0)}</h3>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red">💸</div>
          <div className="stat-info">
            <p>Oylik Chiqim</p>
            <h3>{fmt(stats?.monthExpense ?? 0)}</h3>
          </div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon yellow">📈</div>
          <div className="stat-info">
            <p>Sof Foyda</p>
            <h3>{fmt(stats?.netProfit ?? 0)}</h3>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue">🛒</div>
          <div className="stat-info">
            <p>Bugungi Buyurtma</p>
            <h3>{stats?.todayOrders ?? 0}</h3>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red">⚠️</div>
          <div className="stat-info">
            <p>Sklad Ogohlantirish</p>
            <h3>{stats?.lowStockCount ?? 0} ta</h3>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>📊 Kirim / Chiqim Dinamikasi</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cKirim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cChiqim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }}
                tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8 }}
                formatter={v => [fmt(v)]}
              />
              <Area type="monotone" dataKey="kirim" stroke="#3b82f6"
                fill="url(#cKirim)" strokeWidth={2} name="Kirim" />
              <Area type="monotone" dataKey="chiqim" stroke="#ef4444"
                fill="url(#cChiqim)" strokeWidth={2} name="Chiqim" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>🏭 Oylik Solishtirma</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }}
                tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8 }}
                formatter={v => [fmt(v)]}
              />
              <Legend />
              <Bar dataKey="kirim" fill="#3b82f6" radius={[4,4,0,0]} name="Kirim" />
              <Bar dataKey="chiqim" fill="#ef4444" radius={[4,4,0,0]} name="Chiqim" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats?.recentOrders?.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>🕐 So'nggi Buyurtmalar</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Raqam</th><th>Mijoz</th><th>Summa</th>
                  <th>To'lov</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(o => (
                  <tr key={o._id}>
                    <td>{o.orderNumber}</td>
                    <td>{o.customer?.name}</td>
                    <td className="text-success">{fmt(o.totalAmount)}</td>
                    <td><span className="badge badge-blue">{o.paymentMethod}</span></td>
                    <td>
                      <span className={`badge ${
                        o.status === 'yetkazilgan' ? 'badge-green' :
                        o.status === 'tasdiqlangan' ? 'badge-blue' :
                        o.status === 'bekor' ? 'badge-red' : 'badge-yellow'
                      }`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
