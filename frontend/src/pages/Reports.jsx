import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const fmt = n => new Intl.NumberFormat('uz-UZ').format(n || 0);
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

const expenseCatLabels = {
  xom_ashyo: 'Xom ashyo', yetkazib_berish: 'Yetkazib berish',
  ish_haqi: 'Ish haqi', ijara: 'Ijara', kommunal: 'Kommunal',
  transport: 'Transport', boshqa: 'Boshqa',
};
const incomeCatLabels = {
  sotuv: 'Sotuv', qaytarilgan_pul: 'Qaytarilgan pul', boshqa: 'Boshqa',
};
const methodLabels = { naqd: 'Naqd', plastik: 'Plastik', bank: 'Bank' };

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState({ startDate: '', endDate: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [s, m] = await Promise.all([
        api.get('/reports/summary', { params: period }),
        api.get('/reports/monthly'),
      ]);
      setSummary(s.data);
      setMonthly(m.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [period]);

  // Pie chart datasi
  const expensePie = summary
    ? Object.entries(summary.expenseByCategory).map(([k, v]) => ({
        name: expenseCatLabels[k] || k, value: v,
      }))
    : [];

  const incomePie = summary
    ? Object.entries(summary.incomeByCategory).map(([k, v]) => ({
        name: incomeCatLabels[k] || k, value: v,
      }))
    : [];

  const methodPie = summary
    ? Object.entries(summary.incomeByMethod).map(([k, v]) => ({
        name: methodLabels[k] || k, value: v,
      }))
    : [];

  if (loading) return <div className="loading"><div className="spinner" /> Yuklanmoqda...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>📈 Hisobotlar</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" className="form-control" style={{ width: 160 }}
            value={period.startDate} onChange={e => setPeriod({ ...period, startDate: e.target.value })} />
          <span style={{ color: 'var(--text-3)' }}>—</span>
          <input type="date" className="form-control" style={{ width: 160 }}
            value={period.endDate} onChange={e => setPeriod({ ...period, endDate: e.target.value })} />
          <button className="btn btn-ghost" onClick={() => setPeriod({ startDate: '', endDate: '' })}>
            ♻️
          </button>
        </div>
      </div>

      {/* ===== Asosiy statistika ===== */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card green">
          <div className="stat-icon green">💰</div>
          <div className="stat-info"><p>Jami Kirim</p><h3>{fmt(summary?.totalIncome)} so'm</h3></div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red">💸</div>
          <div className="stat-info"><p>Jami Chiqim</p><h3>{fmt(summary?.totalExpense)} so'm</h3></div>
        </div>
        <div className={`stat-card ${(summary?.netProfit || 0) >= 0 ? 'green' : 'red'}`}>
          <div className={`stat-icon ${(summary?.netProfit || 0) >= 0 ? 'green' : 'red'}`}>📊</div>
          <div className="stat-info">
            <p>Sof Foyda</p>
            <h3 className={(summary?.netProfit || 0) >= 0 ? 'text-success' : 'text-danger'}>
              {fmt(summary?.netProfit)} so'm
            </h3>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue">🛒</div>
          <div className="stat-info"><p>Buyurtmalar</p><h3>{summary?.totalOrders || 0} ta</h3></div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue">👥</div>
          <div className="stat-info"><p>Mijozlar</p><h3>{summary?.totalCustomers || 0} ta</h3></div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon yellow">📋</div>
          <div className="stat-info">
            <p>Tranzaksiyalar</p>
            <h3>{(summary?.incomeCount || 0) + (summary?.expenseCount || 0)} ta</h3>
          </div>
        </div>
      </div>

      {/* ===== Oylik dinamika grafigi ===== */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: 15 }}>📊 So'nggi 6 Oylik Dinamika</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="gKirim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gChiqim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gFoyda" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
            <YAxis stroke="#475569" tick={{ fontSize: 11 }}
              tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8 }}
              formatter={v => [fmt(v) + " so'm"]} />
            <Legend />
            <Area type="monotone" dataKey="kirim" name="Kirim" stroke="#10b981"
              fill="url(#gKirim)" strokeWidth={2} />
            <Area type="monotone" dataKey="chiqim" name="Chiqim" stroke="#ef4444"
              fill="url(#gChiqim)" strokeWidth={2} />
            <Area type="monotone" dataKey="foyda" name="Foyda" stroke="#3b82f6"
              fill="url(#gFoyda)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ===== Bar + Pie chartlar ===== */}
      <div className="chart-grid" style={{ marginBottom: 20 }}>
        {/* Oylik bar */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>📊 Oylik Solishtirma</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }}
                tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8 }}
                formatter={v => [fmt(v) + " so'm"]} />
              <Legend />
              <Bar dataKey="kirim" name="Kirim" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="chiqim" name="Chiqim" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* To'lov usuli */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>💳 Kirim — To'lov Usuli</h3>
          {methodPie.length === 0
            ? <div className="empty-state" style={{ padding: 40 }}>Ma'lumot yo'q</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={methodPie} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    paddingAngle={4} dataKey="value" label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`}>
                    {methodPie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => [fmt(v) + " so'm"]}
                    contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      <div className="chart-grid" style={{ marginBottom: 20 }}>
        {/* Chiqim kategoriyasi */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>💸 Chiqim Kategoriyalari</h3>
          {expensePie.length === 0
            ? <div className="empty-state" style={{ padding: 40 }}>Ma'lumot yo'q</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expensePie} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    paddingAngle={4} dataKey="value" label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`}>
                    {expensePie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => [fmt(v) + " so'm"]}
                    contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Kirim kategoriyasi */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>💰 Kirim Kategoriyalari</h3>
          {incomePie.length === 0
            ? <div className="empty-state" style={{ padding: 40 }}>Ma'lumot yo'q</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={incomePie} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    paddingAngle={4} dataKey="value" label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`}>
                    {incomePie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => [fmt(v) + " so'm"]}
                    contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      {/* ===== Oylik jadval ===== */}
      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 15 }}>📋 Oylik Jadval</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Oy</th>
                <th>Kirim</th>
                <th>Chiqim</th>
                <th>Sof Foyda</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m, i) => {
                const margin = m.kirim > 0 ? ((m.foyda / m.kirim) * 100).toFixed(1) : 0;
                return (
                  <tr key={i}>
                    <td><strong>{m.name}</strong></td>
                    <td className="text-success">{fmt(m.kirim)} so'm</td>
                    <td className="text-danger">{fmt(m.chiqim)} so'm</td>
                    <td className={m.foyda >= 0 ? 'text-success' : 'text-danger'}>
                      <strong>{fmt(m.foyda)} so'm</strong>
                    </td>
                    <td>
                      <span className={`badge ${m.foyda >= 0 ? 'badge-green' : 'badge-red'}`}>
                        {margin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
