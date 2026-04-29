import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Stock() {
  const [stocks, setStocks] = useState([]);
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [addForm, setAddForm] = useState({ product: '', quantity: 1, notes: '', paidNaqd: '', paidPlastik: '', paidBank: '' });
  const [selectedProduct, setSelectedProduct] = useState(null); // qatorda bosilgan mahsulot
  const [tab, setTab] = useState('sklad');

  const load = async () => {
    setLoading(true);
    try {
      const [s, m, p] = await Promise.all([
        api.get('/stock'), api.get('/stock/movements'), api.get('/products'),
      ]);
      setStocks(s.data); setMovements(m.data); setProducts(p.data);
    } catch { toast.error('Xato'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addStock = async () => {
    if (!addForm.product || !addForm.quantity) return toast.error("To'ldiring");
    try {
      await api.post('/stock/add', addForm);
      toast.success("Sklad yangilandi ✅");
      setModal(false);
      setSelectedProduct(null);
      setAddForm({ product: '', quantity: 1, notes: '', paidNaqd: '', paidPlastik: '', paidBank: '' });
      load();
    } catch { toast.error('Xato'); }
  };

  const openKirim = (stockItem = null) => {
    if (stockItem) {
      setSelectedProduct(stockItem.product);
      setAddForm({ product: stockItem.product._id, quantity: 1, notes: '', paidNaqd: '', paidPlastik: '', paidBank: '' });
    } else {
      setSelectedProduct(null);
      setAddForm({ product: '', quantity: 1, notes: '', paidNaqd: '', paidPlastik: '', paidBank: '' });
    }
    setModal(true);
  };

  const fmt = n => new Intl.NumberFormat('uz-UZ').format(n || 0);

  const selectedProdObj = products.find(p => p._id === (selectedProduct?._id || addForm.product));
  const totalAmount = selectedProdObj ? (selectedProdObj.buyPrice || 0) * addForm.quantity : 0;

  return (
    <div>
      <div className="page-header">
        <h2>🏭 Sklad</h2>
        <button className="btn btn-primary" onClick={() => openKirim()}>+ Kirim qilish</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={`btn ${tab === 'sklad' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('sklad')}>📦 Sklad holati</button>
        <button className={`btn ${tab === 'harakat' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('harakat')}>🔄 Harakatlar</button>
      </div>

      {tab === 'sklad' && (
        <div className="card">
          {loading ? <div className="loading"><div className="spinner" /></div>
            : stocks.length === 0 ? <div className="empty-state"><div className="empty-icon">🏭</div><p>Sklad bo'sh</p></div>
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Mahsulot</th><th>Kategoriya</th><th>Miqdor</th><th>Min. chegara</th><th>Holat</th><th></th></tr>
                  </thead>
                  <tbody>
                    {stocks.map(s => (
                      <tr key={s._id}>
                        <td><strong>{s.product?.name}</strong></td>
                        <td><span className="badge badge-blue">{s.product?.category}</span></td>
                        <td>
                          <strong style={{ color: s.quantity === 0 ? '#f87171' : s.quantity <= 100 ? '#f59e0b' : '#4ade80' }}>
                            {fmt(s.quantity)} {s.product?.unit || 'dona'}
                          </strong>
                        </td>
                        <td className="text-muted">{s.minQuantity} {s.product?.unit || 'dona'}</td>
                        <td>
                          <span className={`badge ${s.quantity <= s.minQuantity ? 'badge-red' : s.quantity <= s.minQuantity * 2 ? 'badge-yellow' : 'badge-green'}`}>
                            {s.quantity <= s.minQuantity ? '⚠️ Kam' : s.quantity <= s.minQuantity * 2 ? '🟡 O\'rta' : '✅ Yetarli'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => openKirim(s)}
                          >
                            ⬆️ Kirim
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}

      {tab === 'harakat' && (
        <div className="card">
          {loading ? <div className="loading"><div className="spinner" /></div>
            : movements.length === 0 ? <div className="empty-state"><div className="empty-icon">🔄</div><p>Harakatlar yo'q</p></div>
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Sana</th><th>Mahsulot</th><th>Tur</th><th>Miqdor</th><th>Sabab</th></tr>
                  </thead>
                  <tbody>
                    {movements.map(m => (
                      <tr key={m._id}>
                        <td className="text-muted">{new Date(m.createdAt).toLocaleString('uz-UZ')}</td>
                        <td><strong>{m.product?.name}</strong></td>
                        <td>
                          <span className={`badge ${m.type === 'kirim' ? 'badge-green' : 'badge-red'}`}>
                            {m.type === 'kirim' ? '⬆️ Kirim' : '⬇️ Chiqim'}
                          </span>
                        </td>
                        <td>{fmt(m.quantity)}</td>
                        <td className="text-muted">{m.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>📦 Sklaga Kirim</h2>
              <button className="modal-close" onClick={() => { setModal(false); setSelectedProduct(null); }}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full">
                <label>Mahsulot</label>
                {selectedProduct ? (
                  // Qatorda bosilgan mahsulot — disabled ko'rinish
                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border)',
                    borderRadius: 8, padding: '10px 14px',
                    color: 'var(--text-1)', fontSize: 13.5,
                    display: 'flex', alignItems: 'center', gap: 10,
                    opacity: 0.85,
                  }}>
                    <span style={{ fontSize: 18 }}>📦</span>
                    <div>
                      <strong>{selectedProduct.name}</strong>
                      <span style={{ marginLeft: 8, color: 'var(--text-3)', fontSize: 11 }}>({selectedProduct.category})</span>
                    </div>
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, background: 'rgba(201,168,76,0.15)',
                      color: 'var(--accent)', padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                    }}>🔒 Belgilangan</span>
                  </div>
                ) : (
                  <select className="form-control" value={addForm.product}
                    onChange={e => setAddForm({ ...addForm, product: e.target.value })}>
                    <option value="">Mahsulot tanlang</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.category})</option>)}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Miqdor *</label>
                <input className="form-control" type="number" min="1" value={addForm.quantity}
                  onChange={e => setAddForm({ ...addForm, quantity: +e.target.value })} />
              </div>
              <div className="form-group full" style={{ margin: '4px 0' }}>
                <div style={{ padding: '12px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <strong style={{ color: 'var(--info)' }}>Jami summa (kelish narxi): </strong> 
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{fmt(totalAmount)} so'm</span>
                </div>
              </div>
              <div className="form-group">
                <label>Naqd pulda (so'm)</label>
                <input className="form-control" type="number" min="0" value={addForm.paidNaqd}
                  onChange={e => setAddForm({ ...addForm, paidNaqd: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Kartada (so'm)</label>
                <input className="form-control" type="number" min="0" value={addForm.paidPlastik}
                  onChange={e => setAddForm({ ...addForm, paidPlastik: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Bank orqali (so'm)</label>
                <input className="form-control" type="number" min="0" value={addForm.paidBank}
                  onChange={e => setAddForm({ ...addForm, paidBank: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Izoh</label>
                <input className="form-control" value={addForm.notes}
                  onChange={e => setAddForm({ ...addForm, notes: e.target.value })} placeholder="Yetkazib beruvchi..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setModal(false); setSelectedProduct(null); }}>Bekor</button>
              <button className="btn btn-primary" onClick={addStock}>✅ Kirim qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
