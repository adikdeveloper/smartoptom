import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '', amount: '', category: 'boshqa',
  paymentMethod: 'naqd', notes: '',
  date: new Date().toISOString().slice(0, 10),
};
const cats = [
  { value: 'xom_ashyo', label: 'Xom ashyo' },
  { value: 'yetkazib_berish', label: 'Yetkazib berish' },
  { value: 'ish_haqi', label: 'Ish haqi' },
  { value: 'ijara', label: 'Ijara' },
  { value: 'kommunal', label: 'Kommunal' },
  { value: 'transport', label: 'Transport' },
  { value: 'boshqa', label: 'Boshqa' },
];

export default function Expenses() {
  const [data, setData] = useState({ expenses: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', category: '' });

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/expenses', { params: filter });
      setData(r.data);
    } catch { toast.error('Xato'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const save = async () => {
    if (!form.title || !form.amount) return toast.error("Maydonlarni to'ldiring");
    try {
      await api.post('/expenses', form);
      toast.success("Chiqim qo'shildi ✅");
      setModal(false); load();
    } catch { toast.error('Xato'); }
  };

  const del = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/expenses/${id}`);
    toast.success("O'chirildi"); load();
  };

  const fmt = n => new Intl.NumberFormat('uz-UZ').format(n);
  const catLabel = v => cats.find(c => c.value === v)?.label || v;

  return (
    <div>
      <div className="page-header">
        <h2>💸 Chiqim</h2>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setModal(true); }}>
          + Chiqim qo'shish
        </button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
        <div className="stat-card red">
          <div className="stat-icon red">💸</div>
          <div className="stat-info"><p>Jami Chiqim</p><h3>{fmt(data.total)} so'm</h3></div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue">📋</div>
          <div className="stat-info"><p>Tranzaksiyalar</p><h3>{data.expenses.length} ta</h3></div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red">📊</div>
          <div className="stat-info">
            <p>O'rtacha</p>
            <h3>{data.expenses.length ? fmt(Math.round(data.total / data.expenses.length)) : 0} so'm</h3>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <input type="date" className="form-control" style={{ width: 180 }}
          value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} />
        <input type="date" className="form-control" style={{ width: 180 }}
          value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} />
        <select className="form-control" style={{ width: 200 }} value={filter.category}
          onChange={e => setFilter({ ...filter, category: e.target.value })}>
          <option value="">Barcha kategoriyalar</option>
          {cats.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button className="btn btn-ghost"
          onClick={() => setFilter({ startDate: '', endDate: '', category: '' })}>♻️ Tozalash</button>
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spinner" /></div>
          : data.expenses.length === 0
            ? <div className="empty-state"><div className="empty-icon">💸</div><p>Chiqimlar yo'q</p></div>
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Sana</th><th>Sarlavha</th><th>Kategoriya</th><th>To'lov</th><th>Summa</th><th></th></tr>
                  </thead>
                  <tbody>
                    {data.expenses.map(e => (
                      <tr key={e._id}>
                        <td className="text-muted">{new Date(e.date).toLocaleDateString('uz-UZ')}</td>
                        <td><strong>{e.title}</strong></td>
                        <td><span className="badge badge-red">{catLabel(e.category)}</span></td>
                        <td><span className="badge badge-gray">{e.paymentMethod}</span></td>
                        <td className="text-danger"><strong>{fmt(e.amount)} so'm</strong></td>
                        <td><button className="btn btn-danger btn-sm" onClick={() => del(e._id)}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>💸 Yangi Chiqim</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full">
                <label>Sarlavha *</label>
                <input className="form-control" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Masalan: Ish haqi, Ijara..." />
              </div>
              <div className="form-group">
                <label>Summa (so'm) *</label>
                <input className="form-control" type="number" value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Sana</label>
                <input className="form-control" type="date" value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Kategoriya</label>
                <select className="form-control" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  {cats.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>To'lov usuli</label>
                <select className="form-control" value={form.paymentMethod}
                  onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                  <option value="naqd">Naqd</option>
                  <option value="plastik">Plastik</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
              <div className="form-group full">
                <label>Izoh</label>
                <textarea className="form-control" rows="2" value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Bekor</button>
              <button className="btn btn-primary" onClick={save}>💾 Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
