import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const fmt = n => new Intl.NumberFormat('uz-UZ').format(n || 0);
const today = () => new Date().toISOString().slice(0, 10);

const incomeCategories = [
  { value: 'sotuv', label: 'Sotuv' },
  { value: 'qaytarilgan_pul', label: 'Qaytarilgan pul' },
  { value: 'boshqa', label: 'Boshqa' },
];
const expenseCategories = [
  { value: 'xom_ashyo', label: 'Xom ashyo' },
  { value: 'yetkazib_berish', label: 'Yetkazib berish' },
  { value: 'ish_haqi', label: 'Ish haqi' },
  { value: 'ijara', label: 'Ijara' },
  { value: 'kommunal', label: 'Kommunal' },
  { value: 'transport', label: 'Transport' },
  { value: 'boshqa', label: 'Boshqa' },
];

export default function Finance() {
  const [tab, setTab] = useState('kirim');
  const [incomeData, setIncomeData] = useState({ incomes: [], total: 0 });
  const [expenseData, setExpenseData] = useState({ expenses: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState({ startDate: '', endDate: '' });

  // Form state — tab ga qarab
  const [incomeForm, setIncomeForm] = useState({
    title: '', amount: '', category: 'sotuv', paymentMethod: 'naqd', notes: '', date: today(),
  });
  const [expenseForm, setExpenseForm] = useState({
    title: '', amount: '', category: 'boshqa', paymentMethod: 'naqd', notes: '', date: today(),
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [i, e] = await Promise.all([
        api.get('/income', { params: filter }),
        api.get('/expenses', { params: filter }),
      ]);
      setIncomeData(i.data);
      setExpenseData(e.data);
    } catch { toast.error('Xato'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, [filter]);

  const saveIncome = async () => {
    if (!incomeForm.title || !incomeForm.amount) return toast.error("Maydonlarni to'ldiring");
    try {
      await api.post('/income', incomeForm);
      toast.success('Kirim qo\'shildi ✅');
      setModal(false); loadAll();
    } catch { toast.error('Xato'); }
  };

  const saveExpense = async () => {
    if (!expenseForm.title || !expenseForm.amount) return toast.error("Maydonlarni to'ldiring");
    try {
      await api.post('/expenses', expenseForm);
      toast.success('Chiqim qo\'shildi ✅');
      setModal(false); loadAll();
    } catch { toast.error('Xato'); }
  };

  const delIncome = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/income/${id}`); toast.success("O'chirildi"); loadAll();
  };
  const delExpense = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/expenses/${id}`); toast.success("O'chirildi"); loadAll();
  };

  const netProfit = incomeData.total - expenseData.total;
  const catLabel = (cats, val) => cats.find(c => c.value === val)?.label || val;

  return (
    <div>
      <div className="page-header">
        <h2>💰 Moliya — Kirim & Chiqim</h2>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          + {tab === 'kirim' ? 'Kirim' : 'Chiqim'} qo'shish
        </button>
      </div>

      {/* Umumiy statistika */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card green">
          <div className="stat-icon green">💰</div>
          <div className="stat-info"><p>Jami Kirim</p><h3>{fmt(incomeData.total)} so'm</h3></div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red">💸</div>
          <div className="stat-info"><p>Jami Chiqim</p><h3>{fmt(expenseData.total)} so'm</h3></div>
        </div>
        <div className={`stat-card ${netProfit >= 0 ? 'green' : 'red'}`}>
          <div className={`stat-icon ${netProfit >= 0 ? 'green' : 'red'}`}>📈</div>
          <div className="stat-info">
            <p>Sof Foyda</p>
            <h3 className={netProfit >= 0 ? 'text-success' : 'text-danger'}>
              {fmt(netProfit)} so'm
            </h3>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue">📋</div>
          <div className="stat-info">
            <p>Tranzaksiyalar</p>
            <h3>{incomeData.incomes.length + expenseData.expenses.length} ta</h3>
          </div>
        </div>
      </div>

      {/* Filtr */}
      <div className="search-bar" style={{ marginBottom: 16 }}>
        <input type="date" className="form-control" style={{ width: 180 }}
          value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} />
        <span style={{ color: 'var(--text-3)', alignSelf: 'center' }}>—</span>
        <input type="date" className="form-control" style={{ width: 180 }}
          value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} />
        <button className="btn btn-ghost" onClick={() => setFilter({ startDate: '', endDate: '' })}>
          ♻️ Tozalash
        </button>
      </div>

      {/* Tablar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={`btn ${tab === 'kirim' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('kirim')}>
          💰 Kirim ({incomeData.incomes.length})
        </button>
        <button className={`btn ${tab === 'chiqim' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('chiqim')}>
          💸 Chiqim ({expenseData.expenses.length})
        </button>
        <button className={`btn ${tab === 'barchasi' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('barchasi')}>
          📋 Barchasi
        </button>
      </div>

      {/* ========== KIRIM jadvali ========== */}
      {(tab === 'kirim' || tab === 'barchasi') && (
        <div className="card" style={{ marginBottom: 16 }}>
          {tab === 'barchasi' && (
            <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--success)', fontSize: 15 }}>
              💰 Kirimlar — jami: {fmt(incomeData.total)} so'm
            </div>
          )}
          {loading ? <div className="loading"><div className="spinner" /></div>
            : incomeData.incomes.length === 0
              ? <div className="empty-state"><div className="empty-icon">💰</div><p>Kirimlar yo'q</p></div>
              : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Sana</th><th>Sarlavha</th><th>Kategoriya</th><th>To'lov</th><th>Summa</th><th></th></tr>
                    </thead>
                    <tbody>
                      {incomeData.incomes.map(i => (
                        <tr key={i._id}>
                          <td className="text-muted">{new Date(i.date).toLocaleDateString('uz-UZ')}</td>
                          <td><strong>{i.title}</strong></td>
                          <td><span className="badge badge-blue">{catLabel(incomeCategories, i.category)}</span></td>
                          <td><span className="badge badge-gray">{i.paymentMethod}</span></td>
                          <td><strong className="text-success">{fmt(i.amount)} so'm</strong></td>
                          <td><button className="btn btn-danger btn-sm" onClick={() => delIncome(i._id)}>🗑️</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        </div>
      )}

      {/* ========== CHIQIM jadvali ========== */}
      {(tab === 'chiqim' || tab === 'barchasi') && (
        <div className="card">
          {tab === 'barchasi' && (
            <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--danger)', fontSize: 15 }}>
              💸 Chiqimlar — jami: {fmt(expenseData.total)} so'm
            </div>
          )}
          {loading ? <div className="loading"><div className="spinner" /></div>
            : expenseData.expenses.length === 0
              ? <div className="empty-state"><div className="empty-icon">💸</div><p>Chiqimlar yo'q</p></div>
              : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Sana</th><th>Sarlavha</th><th>Kategoriya</th><th>To'lov</th><th>Summa</th><th></th></tr>
                    </thead>
                    <tbody>
                      {expenseData.expenses.map(e => (
                        <tr key={e._id}>
                          <td className="text-muted">{new Date(e.date).toLocaleDateString('uz-UZ')}</td>
                          <td><strong>{e.title}</strong></td>
                          <td><span className="badge badge-red">{catLabel(expenseCategories, e.category)}</span></td>
                          <td><span className="badge badge-gray">{e.paymentMethod}</span></td>
                          <td><strong className="text-danger">{fmt(e.amount)} so'm</strong></td>
                          <td><button className="btn btn-danger btn-sm" onClick={() => delExpense(e._id)}>🗑️</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        </div>
      )}

      {/* ========== MODAL ========== */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            {/* Tab tanlash */}
            <div className="modal-header">
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={`btn btn-sm ${tab === 'kirim' ? 'btn-success' : 'btn-ghost'}`}
                  onClick={() => setTab('kirim')}>💰 Kirim</button>
                <button className={`btn btn-sm ${tab === 'chiqim' ? 'btn-danger' : 'btn-ghost'}`}
                  onClick={() => setTab('chiqim')}>💸 Chiqim</button>
              </div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>

            {/* KIRIM formasi */}
            {tab === 'kirim' && (
              <div className="form-grid">
                <div className="form-group full">
                  <label>Sarlavha *</label>
                  <input className="form-control" value={incomeForm.title}
                    onChange={e => setIncomeForm({ ...incomeForm, title: e.target.value })}
                    placeholder="Naqd sotuv, To'lov..." />
                </div>
                <div className="form-group">
                  <label>Summa (so'm) *</label>
                  <input className="form-control" type="number" value={incomeForm.amount}
                    onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Sana</label>
                  <input className="form-control" type="date" value={incomeForm.date}
                    onChange={e => setIncomeForm({ ...incomeForm, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Kategoriya</label>
                  <select className="form-control" value={incomeForm.category}
                    onChange={e => setIncomeForm({ ...incomeForm, category: e.target.value })}>
                    {incomeCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>To'lov usuli</label>
                  <select className="form-control" value={incomeForm.paymentMethod}
                    onChange={e => setIncomeForm({ ...incomeForm, paymentMethod: e.target.value })}>
                    <option value="naqd">Naqd</option>
                    <option value="plastik">Plastik</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Izoh</label>
                  <textarea className="form-control" rows="2" value={incomeForm.notes}
                    onChange={e => setIncomeForm({ ...incomeForm, notes: e.target.value })} />
                </div>
              </div>
            )}

            {/* CHIQIM formasi */}
            {tab === 'chiqim' && (
              <div className="form-grid">
                <div className="form-group full">
                  <label>Sarlavha *</label>
                  <input className="form-control" value={expenseForm.title}
                    onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })}
                    placeholder="Ijara, Ish haqi..." />
                </div>
                <div className="form-group">
                  <label>Summa (so'm) *</label>
                  <input className="form-control" type="number" value={expenseForm.amount}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Sana</label>
                  <input className="form-control" type="date" value={expenseForm.date}
                    onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Kategoriya</label>
                  <select className="form-control" value={expenseForm.category}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                    {expenseCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>To'lov usuli</label>
                  <select className="form-control" value={expenseForm.paymentMethod}
                    onChange={e => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}>
                    <option value="naqd">Naqd</option>
                    <option value="plastik">Plastik</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Izoh</label>
                  <textarea className="form-control" rows="2" value={expenseForm.notes}
                    onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Bekor</button>
              <button
                className={`btn ${tab === 'kirim' ? 'btn-success' : 'btn-danger'}`}
                onClick={tab === 'kirim' ? saveIncome : saveExpense}>
                💾 Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
