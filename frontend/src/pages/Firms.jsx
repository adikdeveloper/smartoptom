import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Firms() {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [firmModal, setFirmModal] = useState(false);
  const [txModal, setTxModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);

  // Forms
  const [firmForm, setFirmForm] = useState({ name: '', products: '' });
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [txForm, setTxForm] = useState({ type: 'tolov', amount: '', paymentMethod: 'naqd', notes: '' });
  
  // History data
  const [transactions, setTransactions] = useState([]);

  const loadFirms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/firms');
      setFirms(res.data);
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFirms(); }, []);

  const saveFirm = async () => {
    if (!firmForm.name) return toast.error("Kompaniya nomini kiriting");
    try {
      await api.post('/firms', firmForm);
      toast.success("Firma qo'shildi ✅");
      setFirmModal(false);
      setFirmForm({ name: '', products: '' });
      loadFirms();
    } catch {
      toast.error('Xato');
    }
  };

  const deleteFirm = async (id) => {
    if (!confirm("Firmani o'chirishni tasdiqlaysizmi? Barcha tarixi ham o'chadi!")) return;
    try {
      await api.delete(`/firms/${id}`);
      toast.success("O'chirildi");
      loadFirms();
    } catch { toast.error('Xato'); }
  };

  const openTxModal = (firm) => {
    setSelectedFirm(firm);
    setTxForm({ type: 'tolov', amount: '', paymentMethod: 'naqd', notes: '' });
    setTxModal(true);
  };

  const saveTx = async () => {
    if (!txForm.amount) return toast.error("Summani kiriting");
    try {
      await api.post(`/firms/${selectedFirm._id}/transactions`, txForm);
      toast.success("Amaliyot saqlandi ✅");
      setTxModal(false);
      loadFirms();
    } catch {
      toast.error('Xato');
    }
  };

  const openHistory = async (firm) => {
    setSelectedFirm(firm);
    try {
      const res = await api.get(`/firms/${firm._id}/transactions`);
      setTransactions(res.data);
      setHistoryModal(true);
    } catch {
      toast.error('Tarixni yuklashda xato');
    }
  };

  const fmt = n => new Intl.NumberFormat('uz-UZ').format(n || 0);

  // Umumiy qarzni hisoblash
  const totalDebt = firms.reduce((sum, f) => sum + (f.debt || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h2>🏢 Firmalar (Ta'minotchilar)</h2>
        <button className="btn btn-primary" onClick={() => setFirmModal(true)}>+ Firma qo'shish</button>
      </div>

      <div className="stat-grid">
        <div className="stat-card red">
          <div className="stat-icon red">💸</div>
          <div className="stat-info"><p>Umumiy Qarzimiz</p><h3>{fmt(totalDebt)} so'm</h3></div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue">🏢</div>
          <div className="stat-info"><p>Jami firmalar</p><h3>{firms.length} ta</h3></div>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spinner" /></div>
          : firms.length === 0 ? <div className="empty-state"><div className="empty-icon">🏢</div><p>Firmalar yo'q</p></div>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Firma Nomi</th>
                    <th>Mahsulotlari</th>
                    <th>Qarzimiz</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {firms.map(f => (
                    <tr key={f._id}>
                      <td><strong>{f.name}</strong></td>
                      <td className="text-muted">{f.products || '—'}</td>
                      <td>
                        <strong style={{ color: f.debt > 0 ? 'var(--danger)' : 'var(--success)' }}>
                          {fmt(f.debt)} so'm
                        </strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => openTxModal(f)}>💰 Amaliyot</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => openHistory(f)}>📋 Tarix</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteFirm(f._id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* ===== Firma qo'shish Modal ===== */}
      {firmModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setFirmModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>🏢 Yangi Firma</h2>
              <button className="modal-close" onClick={() => setFirmModal(false)}>✕</button>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Firma nomi *</label>
              <input className="form-control" value={firmForm.name}
                onChange={e => setFirmForm({ ...firmForm, name: e.target.value })} placeholder="Masalan: Elmakon MCHJ" />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Keltiradigan mahsulotlari</label>
              <input className="form-control" value={firmForm.products}
                onChange={e => setFirmForm({ ...firmForm, products: e.target.value })} placeholder="Baklashka, krishka, kuler..." />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setFirmModal(false)}>Bekor</button>
              <button className="btn btn-primary" onClick={saveFirm}>✅ Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Amaliyot (Tranzaksiya) Modal ===== */}
      {txModal && selectedFirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setTxModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>💰 Amaliyot: {selectedFirm.name}</h2>
              <button className="modal-close" onClick={() => setTxModal(false)}>✕</button>
            </div>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button className={`btn ${txForm.type === 'tolov' ? 'btn-success' : 'btn-ghost'}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setTxForm({ ...txForm, type: 'tolov' })}>
                ⬆️ Pul o'tkazish (To'lov)
              </button>
              <button className={`btn ${txForm.type === 'qarz' ? 'btn-danger' : 'btn-ghost'}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setTxForm({ ...txForm, type: 'qarz' })}>
                ⬇️ Mahsulot olish (Qarz)
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Summa (so'm) *</label>
              <input className="form-control" type="number" min="0" value={txForm.amount}
                onChange={e => setTxForm({ ...txForm, amount: e.target.value })} />
            </div>

            {txForm.type === 'tolov' && (
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>To'lov usuli</label>
                <select className="form-control" value={txForm.paymentMethod}
                  onChange={e => setTxForm({ ...txForm, paymentMethod: e.target.value })}>
                  <option value="naqd">Naqd pulda</option>
                  <option value="plastik">Kartada</option>
                  <option value="bank">Bank o'tkazmasida</option>
                </select>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Izoh</label>
              <textarea className="form-control" rows="2" value={txForm.notes}
                onChange={e => setTxForm({ ...txForm, notes: e.target.value })} 
                placeholder={txForm.type === 'tolov' ? "Qarzni uzish..." : "1000 ta baklashka olindi..."} />
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setTxModal(false)}>Bekor</button>
              <button className={`btn ${txForm.type === 'tolov' ? 'btn-success' : 'btn-danger'}`} onClick={saveTx}>
                ✅ Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Tarix Modal ===== */}
      {historyModal && selectedFirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setHistoryModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2>📋 Tarix: {selectedFirm.name}</h2>
              <button className="modal-close" onClick={() => setHistoryModal(false)}>✕</button>
            </div>
            
            <div style={{ marginBottom: 16, background: 'var(--bg-hover)', padding: 16, borderRadius: 12 }}>
              <span className="text-muted">Joriy qarzimiz: </span>
              <strong style={{ fontSize: 20, color: selectedFirm.debt > 0 ? 'var(--danger)' : 'var(--success)' }}>
                {fmt(selectedFirm.debt)} so'm
              </strong>
            </div>

            {transactions.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📋</div><p>Tarix bo'sh</p></div>
            ) : (
              <div className="table-wrap" style={{ maxHeight: 400, margin: 0, overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Sana</th>
                      <th>Tur</th>
                      <th>Summa</th>
                      <th>To'lov Usuli</th>
                      <th>Izoh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx._id}>
                        <td className="text-muted" style={{ fontSize: 13 }}>
                          {new Date(tx.date).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td>
                          <span className={`badge ${tx.type === 'tolov' ? 'badge-green' : 'badge-red'}`}>
                            {tx.type === 'tolov' ? '⬆️ To'lov qildik' : '⬇️ Mahsulot oldik'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: tx.type === 'tolov' ? 'var(--success)' : 'var(--danger)' }}>
                            {fmt(tx.amount)} so'm
                          </strong>
                        </td>
                        <td>
                          {tx.type === 'tolov' ? (
                            <span className="badge badge-gray">{tx.paymentMethod}</span>
                          ) : '—'}
                        </td>
                        <td className="text-muted" style={{ fontSize: 13 }}>{tx.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setHistoryModal(false)}>Yopish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
