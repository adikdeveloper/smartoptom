import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const statusLabel = { tolanmagan: "To'lanmagan", qisman: 'Qisman', tolangan: "To'langan" };
const statusBadge = { tolanmagan: 'badge-red', qisman: 'badge-yellow', tolangan: 'badge-green' };
const fmt = n => new Intl.NumberFormat('uz-UZ').format(n || 0);

const emptyForm = { customer: '', totalAmount: '', paidAmount: 0, dueDate: '', notes: '' };

export default function Debts() {
  const [data, setData] = useState({ debts: [], totalDebt: 0, totalCount: 0, unpaidCount: 0 });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [payModal, setPayModal] = useState(null); // selected debt for payment
  const [form, setForm] = useState(emptyForm);
  const [payForm, setPayForm] = useState({ amount: '', paymentMethod: 'naqd', notes: '' });
  const [detailDebt, setDetailDebt] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([
        api.get('/debts', { params: { status: statusFilter || undefined } }),
        api.get('/customers'),
      ]);
      setData(d.data);
      setCustomers(c.data);
    } catch { toast.error('Yuklab bo\'lmadi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  // Yangi qarz qo'shish
  const saveDebt = async () => {
    if (!form.customer || !form.totalAmount) return toast.error("Maydonlarni to'ldiring");
    try {
      await api.post('/debts', form);
      toast.success("Qarz qo'shildi ✅");
      setModal(false); load();
    } catch { toast.error('Xato'); }
  };

  // To'lov qilish
  const payDebt = async () => {
    if (!payForm.amount || +payForm.amount <= 0) return toast.error("Summa kiriting");
    try {
      await api.post(`/debts/${payModal._id}/pay`, payForm);
      toast.success("To'lov amalga oshirildi ✅");
      setPayModal(null); load();
    } catch { toast.error('Xato'); }
  };

  // O'chirish
  const del = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/debts/${id}`);
    toast.success("O'chirildi"); load();
  };

  return (
    <div>
      <div className="page-header">
        <h2>💳 Qarzdorliklar</h2>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setModal(true); }}>
          + Qarz qo'shish
        </button>
      </div>

      {/* Statistika */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
        <div className="stat-card red">
          <div className="stat-icon red">💳</div>
          <div className="stat-info"><p>Umumiy Qarz</p><h3>{fmt(data.totalDebt)} so'm</h3></div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon yellow">⚠️</div>
          <div className="stat-info"><p>To'lanmagan</p><h3>{data.unpaidCount} ta</h3></div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue">📋</div>
          <div className="stat-info"><p>Jami yozuvlar</p><h3>{data.totalCount} ta</h3></div>
        </div>
      </div>

      {/* Filter */}
      <div className="search-bar" style={{ marginBottom: 16 }}>
        {['', 'tolanmagan', 'qisman', 'tolangan'].map(s => (
          <button key={s}
            className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setStatusFilter(s)}>
            {s === '' ? '📋 Barchasi' :
              s === 'tolanmagan' ? "🔴 To'lanmagan" :
              s === 'qisman' ? '🟡 Qisman' : "🟢 To'langan"}
          </button>
        ))}
      </div>

      {/* Jadval */}
      <div className="card">
        {loading ? <div className="loading"><div className="spinner" /></div>
          : data.debts.length === 0
            ? <div className="empty-state"><div className="empty-icon">💳</div><p>Qarzdorlik topilmadi</p></div>
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Mijoz</th>
                      <th>Telefon</th>
                      <th>Jami summa</th>
                      <th>To'langan</th>
                      <th>Qolgan qarz</th>
                      <th>Muddat</th>
                      <th>Holat</th>
                      <th>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.debts.map(d => (
                      <tr key={d._id}>
                        <td>
                          <strong
                            style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--accent)' }}
                            onClick={() => setDetailDebt(d)}
                          >
                            {d.customer?.name}
                          </strong>
                          {d.order && (
                            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                              📦 {d.order.orderNumber}
                            </div>
                          )}
                        </td>
                        <td className="text-muted">{d.customer?.phone}</td>
                        <td>{fmt(d.totalAmount)} so'm</td>
                        <td className="text-success">{fmt(d.paidAmount)} so'm</td>
                        <td>
                          <strong className={d.remaining > 0 ? 'text-danger' : 'text-success'}>
                            {fmt(d.remaining)} so'm
                          </strong>
                        </td>
                        <td className="text-muted">
                          {d.dueDate ? new Date(d.dueDate).toLocaleDateString('uz-UZ') : '—'}
                        </td>
                        <td>
                          <span className={`badge ${statusBadge[d.status]}`}>
                            {statusLabel[d.status]}
                          </span>
                        </td>
                        <td style={{ display: 'flex', gap: 6 }}>
                          {d.status !== 'tolangan' && (
                            <button className="btn btn-success btn-sm"
                              onClick={() => { setPayModal(d); setPayForm({ amount: d.remaining, paymentMethod: 'naqd', notes: '' }); }}>
                              💵 To'lov
                            </button>
                          )}
                          <button className="btn btn-danger btn-sm" onClick={() => del(d._id)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>

      {/* ============ Yangi Qarz Modal ============ */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>💳 Yangi Qarz Qo'shish</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full">
                <label>Mijoz *</label>
                <select className="form-control" value={form.customer}
                  onChange={e => setForm({ ...form, customer: e.target.value })}>
                  <option value="">Mijoz tanlang</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Jami qarz summasi (so'm) *</label>
                <input className="form-control" type="number"
                  value={form.totalAmount}
                  onChange={e => setForm({ ...form, totalAmount: e.target.value })}
                  placeholder="500000" />
              </div>
              <div className="form-group">
                <label>Oldindan to'langan (so'm)</label>
                <input className="form-control" type="number"
                  value={form.paidAmount}
                  onChange={e => setForm({ ...form, paidAmount: e.target.value })}
                  placeholder="0" />
              </div>
              <div className="form-group">
                <label>To'lash muddati</label>
                <input className="form-control" type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="form-group full">
                <label>Izoh</label>
                <textarea className="form-control" rows="2"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Qarz sababi yoki izoh..." />
              </div>
            </div>
            {form.totalAmount && (
              <div style={{
                marginTop: 12, padding: '10px 14px',
                background: 'rgba(239,68,68,0.1)', borderRadius: 8,
                border: '1px solid rgba(239,68,68,0.3)', fontSize: 14,
              }}>
                💳 Qolgan qarz:{' '}
                <strong className="text-danger">
                  {fmt((+form.totalAmount || 0) - (+form.paidAmount || 0))} so'm
                </strong>
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Bekor</button>
              <button className="btn btn-primary" onClick={saveDebt}>💾 Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ To'lov Modal ============ */}
      {payModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPayModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>💵 Qarz To'lovi — {payModal.customer?.name}</h2>
              <button className="modal-close" onClick={() => setPayModal(null)}>✕</button>
            </div>

            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg-dark)', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="text-muted">Jami qarz:</span>
                <strong>{fmt(payModal.totalAmount)} so'm</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="text-muted">To'langan:</span>
                <span className="text-success">{fmt(payModal.paidAmount)} so'm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Qolgan:</span>
                <strong className="text-danger">{fmt(payModal.remaining)} so'm</strong>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>To'lov summasi (so'm) *</label>
                <input className="form-control" type="number"
                  value={payForm.amount}
                  onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                  max={payModal.remaining} />
              </div>
              <div className="form-group">
                <label>To'lov usuli</label>
                <select className="form-control" value={payForm.paymentMethod}
                  onChange={e => setPayForm({ ...payForm, paymentMethod: e.target.value })}>
                  <option value="naqd">💵 Naqd</option>
                  <option value="plastik">💳 Plastik</option>
                  <option value="bank">🏦 Bank</option>
                </select>
              </div>
              <div className="form-group full">
                <label>Izoh</label>
                <input className="form-control" value={payForm.notes}
                  onChange={e => setPayForm({ ...payForm, notes: e.target.value })}
                  placeholder="Ixtiyoriy..." />
              </div>
            </div>

            {/* To'lov tarixi */}
            {payModal.payments?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-2)' }}>
                  📜 To'lov tarixi
                </div>
                {payModal.payments.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '6px 0', borderBottom: '1px solid var(--border)',
                    fontSize: 13,
                  }}>
                    <span className="text-muted">{new Date(p.date).toLocaleDateString('uz-UZ')}</span>
                    <span className="text-success">+{fmt(p.amount)} so'm</span>
                    <span className="badge badge-gray">{p.paymentMethod}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPayModal(null)}>Bekor</button>
              <button className="btn btn-success" onClick={payDebt}>✅ To'lovni tasdiqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ Detail Modal ============ */}
      {detailDebt && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetailDebt(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>📋 {detailDebt.customer?.name} — Qarz tafsiloti</h2>
              <button className="modal-close" onClick={() => setDetailDebt(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Mijoz', detailDebt.customer?.name],
                ['Telefon', detailDebt.customer?.phone],
                ['Kompaniya', detailDebt.customer?.company || '—'],
                ['Buyurtma', detailDebt.order?.orderNumber || '—'],
                ['Jami summa', fmt(detailDebt.totalAmount) + " so'm"],
                ["To'langan", fmt(detailDebt.paidAmount) + " so'm"],
                ['Qolgan qarz', fmt(detailDebt.remaining) + " so'm"],
                ['Muddat', detailDebt.dueDate ? new Date(detailDebt.dueDate).toLocaleDateString('uz-UZ') : '—'],
                ['Holat', statusLabel[detailDebt.status]],
                ['Izoh', detailDebt.notes || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <span className="text-muted">{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetailDebt(null)}>Yopish</button>
              {detailDebt.status !== 'tolangan' && (
                <button className="btn btn-success" onClick={() => {
                  setPayModal(detailDebt);
                  setPayForm({ amount: detailDebt.remaining, paymentMethod: 'naqd', notes: '' });
                  setDetailDebt(null);
                }}>💵 To'lov qilish</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
