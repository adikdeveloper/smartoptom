import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const emptyOrder = {
  customer: '', paymentMethod: 'naqd',
  paidAmount: 0, deliveryAddress: '', notes: '', items: [],
};

// ===== Mahsulot qidirish komponenti =====
function ProductSearch({ products, value, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const selected = products.find(p => p._id === value);

  const filtered = query.length > 0
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  // Tashqariga bosilganda yopilsin
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (product) => {
    onSelect(product);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', flex: '2' }}>
      <input
        className="form-control"
        placeholder={selected ? selected.name + ` (${selected.category})` : '🔍 Mahsulot qidiring...'}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        style={selected ? { borderColor: 'var(--accent)' } : {}}
      />
      {selected && !query && (
        <div style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          fontSize: 11, color: 'var(--accent)', pointerEvents: 'none', fontWeight: 600,
        }}>
          ✓ {selected.category}
        </div>
      )}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, marginTop: 4, maxHeight: 200, overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '12px 14px', color: 'var(--text-3)', fontSize: 13 }}>
              Mahsulot topilmadi
            </div>
          ) : filtered.map(p => (
            <div key={p._id} onClick={() => pick(p)}
              style={{
                padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'background 0.15s',
                background: value === p._id ? 'rgba(59,130,246,0.15)' : 'transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = value === p._id ? 'rgba(59,130,246,0.15)' : 'transparent'}
            >
              <div>
                <strong>{p.name}</strong>
                <span style={{ marginLeft: 8, color: 'var(--text-3)', fontSize: 11 }}>({p.category})</span>
              </div>
              <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: 12 }}>
                {new Intl.NumberFormat('uz-UZ').format(p.sellPrice)} so'm
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyOrder);
  const [items, setItems] = useState([{ product: '', quantity: 1, price: 0, total: 0 }]);
  const [receipt, setReceipt] = useState(null); // chek uchun

  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [o, c, p] = await Promise.all([
        api.get('/orders'), api.get('/customers'), api.get('/products'),
      ]);
      setOrders(o.data); setCustomers(c.data); setProducts(p.data);
    } catch { toast.error('Xato'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(emptyOrder);
    setItems([{ product: '', quantity: 1, price: 0, total: 0 }]);
    setModal(true);
    setSaving(false);
  };

  const updateItem = (i, field, val) => {
    const copy = [...items];
    copy[i][field] = val;
    copy[i].total = copy[i].quantity * copy[i].price;
    setItems(copy);
  };

  const selectProduct = (i, product) => {
    const copy = [...items];
    copy[i].product = product._id;
    copy[i].price = product.sellPrice || 0;
    copy[i].total = copy[i].quantity * copy[i].price;
    setItems(copy);
  };

  const addItem = () => setItems([...items, { product: '', quantity: 1, price: 0, total: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const fmt = n => new Intl.NumberFormat('uz-UZ').format(n);

  const save = async () => {
    if (saving) return;
    if (!form.customer) return toast.error('Mijoz tanlang');
    if (items.some(i => !i.product)) return toast.error('Barcha mahsulotlarni tanlang');
    
    setSaving(true);
    try {
      const customer = customers.find(c => c._id === form.customer);
      const payload = {
        ...form,
        status: 'yangi',
        items: items.map(i => ({ product: i.product, quantity: +i.quantity, price: +i.price, total: i.total })),
        subtotal,
        totalAmount: subtotal,
        paidAmount: +form.paidAmount,
      };
      const res = await api.post('/orders', payload);
      toast.success("Buyurtma qo'shildi! ✅");
      setModal(false);
      // Chek uchun ma'lumotlarni yig'amiz
      setReceipt({
        ...res.data,
        customer,
        itemsDetailed: items.map(it => ({
          ...it,
          productName: products.find(p => p._id === it.product)?.name || '—',
          category: products.find(p => p._id === it.product)?.category || '',
        })),
        subtotal,
        paidAmount: +form.paidAmount,
        remainingDebt: subtotal - (+form.paidAmount),
        paymentMethod: form.paymentMethod,
        deliveryAddress: form.deliveryAddress,
      });
      load();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Xato yuz berdi'); 
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/orders/${id}`); toast.success("O'chirildi"); load();
  };

  const statusBadge = s => ({ yangi:'badge-yellow', tasdiqlangan:'badge-blue', yetkazilgan:'badge-green', bekor:'badge-red' })[s] || 'badge-gray';

  return (
    <div>
      <div className="page-header">
        <h2>🛒 Buyurtmalar</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Yangi buyurtma</button>
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spinner" /></div>
          : orders.length === 0
            ? <div className="empty-state"><div className="empty-icon">🛒</div><p>Buyurtmalar yo'q</p></div>
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Raqam</th><th>Mijoz</th><th>Summa</th>
                      <th>To'langan</th><th>Qarz</th><th>To'lov</th><th>Status</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id}>
                        <td><strong>{o.orderNumber}</strong></td>
                        <td>{o.customer?.name}</td>
                        <td className="text-success">{fmt(o.totalAmount)} so'm</td>
                        <td>{fmt(o.paidAmount)} so'm</td>
                        <td className={o.remainingDebt > 0 ? 'text-danger' : 'text-success'}>
                          {fmt(o.remainingDebt)} so'm
                        </td>
                        <td><span className="badge badge-blue">{o.paymentMethod}</span></td>
                        <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                        <td><button className="btn btn-danger btn-sm" onClick={() => del(o._id)}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2>🛒 Yangi Buyurtma</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>

            {/* Mijoz */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Mijoz *</label>
              <select className="form-control" value={form.customer}
                onChange={e => setForm({ ...form, customer: e.target.value })}>
                <option value="">Mijoz tanlang</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>
                ))}
              </select>
            </div>

            {/* Mahsulotlar */}
            <div style={{ margin: '4px 0 10px', fontWeight: 600, fontSize: 14 }}>📦 Mahsulotlar</div>
            {items.map((item, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr auto',
                gap: 8, marginBottom: 8, alignItems: 'center',
              }}>
                {/* Qidiruv bilan mahsulot tanlash */}
                <ProductSearch
                  products={products}
                  value={item.product}
                  onSelect={(p) => selectProduct(i, p)}
                />
                <input className="form-control" type="number" placeholder="Miqdor" min="1"
                  value={item.quantity}
                  onChange={e => updateItem(i, 'quantity', +e.target.value)} />
                <input className="form-control" type="number" placeholder="Narx"
                  value={item.price}
                  onChange={e => updateItem(i, 'price', +e.target.value)} />
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>✕</button>
              </div>
            ))}

            {/* Subtotal */}
            {items.map((item, i) => item.product && (
              <div key={`t-${i}`} style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4, paddingLeft: 4 }}>
                {products.find(p => p._id === item.product)?.name}: {item.quantity} × {fmt(item.price)} = <strong style={{ color: 'var(--success)' }}>{fmt(item.total)} so'm</strong>
              </div>
            ))}

            <button className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginBottom: 12, marginTop: 4 }}>
              + Mahsulot qo'shish
            </button>

            <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
              <strong>Jami: <span className="text-success">{fmt(subtotal)} so'm</span></strong>
            </div>

            {/* To'lov */}
            <div className="form-grid">
              <div className="form-group">
                <label>To'lov usuli</label>
                <select className="form-control" value={form.paymentMethod}
                  onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                  <option value="naqd">💵 Naqd</option>
                  <option value="plastik">💳 Plastik</option>
                  <option value="nasiya">📋 Nasiya</option>
                  <option value="bank">🏦 Bank</option>
                </select>
              </div>
              <div className="form-group">
                <label>To'langan summa</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-control"
                    type="number"
                    value={form.paidAmount}
                    onChange={e => setForm({ ...form, paidAmount: e.target.value })}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    title="Barcha summani to'liq to'lash"
                    onClick={() => setForm({ ...form, paidAmount: subtotal })}
                    style={{
                      position: 'absolute', right: 6, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none', borderRadius: 6, width: 30, height: 30,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: 16, transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    ✅
                  </button>
                </div>
              </div>
              <div className="form-group full">
                <label>Yetkazish manzili</label>
                <input className="form-control" value={form.deliveryAddress}
                  onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
                  placeholder="Ko'cha, uy, mahalla..." />
              </div>
            </div>

            {/* Qarz ko'rsatgich */}
            {subtotal > 0 && +form.paidAmount < subtotal && (
              <div style={{
                marginTop: 8, padding: '10px 14px',
                background: 'rgba(239,68,68,0.1)', borderRadius: 8,
                border: '1px solid rgba(239,68,68,0.3)', fontSize: 13,
              }}>
                ⚠️ Qarz: <strong className="text-danger">
                  {fmt(subtotal - (+form.paidAmount || 0))} so'm
                </strong> — qarzdorlikka yoziladi
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Bekor</button>
              <button className="btn btn-primary" onClick={save} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? '⏳ Saqlanmoqda...' : '✅ Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ CHEk MODAL ============ */}
      {receipt && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div style={{
            background: '#fff', color: '#000', borderRadius: 12,
            width: 380, padding: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            fontFamily: "'Courier New', monospace",
          }}>
            {/* Chek header */}
            <div style={{
              background: '#1a1a2e', color: '#fff', padding: '18px 24px',
              borderRadius: '12px 12px 0 0', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28 }}>💧</div>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>AQUA CRM</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Optom Suv Do'koni</div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Chek raqami va sana */}
              <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '2px dashed #ccc', paddingBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>#{receipt.orderNumber}</div>
                <div style={{ fontSize: 12, color: '#555' }}>
                  {new Date().toLocaleString('uz-UZ', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Mijoz */}
              <div style={{ marginBottom: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#555' }}>Mijoz:</span>
                  <strong>{receipt.customer?.name}</strong>
                </div>
                {receipt.customer?.phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#555' }}>Telefon:</span>
                    <span>{receipt.customer.phone}</span>
                  </div>
                )}
              </div>

              {/* Mahsulotlar */}
              <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '10px 0', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#777', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase' }}>
                  Mahsulotlar
                </div>
                {receipt.itemsDetailed.map((it, i) => (
                  <div key={i} style={{ marginBottom: 6, fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{it.productName} <span style={{ color: '#777', fontSize: 11 }}>({it.category})</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: 12 }}>
                      <span>{it.quantity} × {fmt(it.price)} so'm</span>
                      <strong>{fmt(it.total)} so'm</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summalar */}
              <div style={{ fontSize: 13, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Jami:</span>
                  <strong>{fmt(receipt.subtotal)} so'm</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#16a34a' }}>
                  <span>To'landi:</span>
                  <strong>{fmt(receipt.paidAmount)} so'm</strong>
                </div>
                {receipt.remainingDebt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', marginBottom: 4 }}>
                    <span>Qarz:</span>
                    <strong>{fmt(receipt.remainingDebt)} so'm</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                  <span>To'lov usuli:</span>
                  <span style={{ textTransform: 'capitalize' }}>{receipt.paymentMethod}</span>
                </div>
                {receipt.deliveryAddress && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', marginTop: 4 }}>
                    <span>Manzil:</span>
                    <span style={{ textAlign: 'right', maxWidth: 180, fontSize: 11 }}>{receipt.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                textAlign: 'center', borderTop: '2px dashed #ccc',
                paddingTop: 10, fontSize: 11, color: '#777',
              }}>
                <div>Xarid uchun rahmat! 🙏</div>
                <div style={{ marginTop: 2 }}>AquaCRM • aquacrm.uz</div>
              </div>
            </div>

            {/* Tugmalar */}
            <div style={{
              display: 'flex', gap: 8, padding: '12px 24px 20px',
              borderTop: '1px solid #eee',
            }}>
              <button
                onClick={() => {
                  const printContents = document.getElementById('receipt-print').innerHTML;
                  const w = window.open('', '_blank', 'width=420,height=650');
                  w.document.write(`
                    <html><head><title>Chek - ${receipt.orderNumber}</title>
                    <style>
                      body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; background: #fff; color: #000; }
                      * { box-sizing: border-box; }
                    </style></head>
                    <body>${printContents}</body></html>
                  `);
                  w.document.close();
                  w.focus();
                  w.print();
                  w.close();
                }}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                  background: '#1a1a2e', color: '#fff', cursor: 'pointer',
                  fontWeight: 600, fontSize: 14,
                }}
              >
                🖨️ Chop etish
              </button>
              <button
                onClick={() => setReceipt(null)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8,
                  border: '1px solid #ddd', background: '#f5f5f5',
                  color: '#333', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                }}
              >
                ✕ Yopish
              </button>
            </div>

            {/* Print uchun yashirin div */}
            <div id="receipt-print" style={{ display: 'none' }}>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>💧 AQUA CRM</h2>
                <div style={{ fontSize: 12 }}>Optom Suv Do'koni</div>
                <div style={{ borderBottom: '2px dashed #000', margin: '8px 0' }}></div>
                <div><strong>#{receipt.orderNumber}</strong></div>
                <div style={{ fontSize: 12 }}>{new Date().toLocaleString('uz-UZ')}</div>
              </div>
              <div style={{ marginBottom: 8, fontSize: 13 }}>
                <b>Mijoz:</b> {receipt.customer?.name}<br />
                {receipt.customer?.phone && <><b>Tel:</b> {receipt.customer.phone}<br /></>}
              </div>
              <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '8px 0' }}>
                {receipt.itemsDetailed.map((it, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    <b>{it.productName}</b> ({it.category})<br />
                    {it.quantity} × {fmt(it.price)} = <b>{fmt(it.total)} so'm</b>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13 }}>
                <b>Jami: {fmt(receipt.subtotal)} so'm</b><br />
                To'landi: {fmt(receipt.paidAmount)} so'm<br />
                {receipt.remainingDebt > 0 && <><b style={{ color: 'red' }}>Qarz: {fmt(receipt.remainingDebt)} so'm</b><br /></>}
                To'lov: {receipt.paymentMethod}
                {receipt.deliveryAddress && <><br />Manzil: {receipt.deliveryAddress}</>}
              </div>
              <div style={{ textAlign: 'center', marginTop: 12, borderTop: '2px dashed #000', paddingTop: 8, fontSize: 12 }}>
                Xarid uchun rahmat!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
