import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const empty = { name: '', category: '19L', buyPrice: '', sellPrice: '', wholesalePrice: '', description: '' };
const cats = ['19L', '10L', '5L', '1.5L', '1.0L', '0.5L'];

export default function Products() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/products'); setList(r.data); }
    catch { toast.error('Xato'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit = (p) => { setForm(p); setEditId(p._id); setModal(true); };
  const close = () => setModal(false);

  const save = async () => {
    try {
      if (editId) { await api.put(`/products/${editId}`, form); toast.success('Yangilandi'); }
      else { await api.post('/products', form); toast.success("Mahsulot qo'shildi"); }
      close(); load();
    } catch { toast.error('Xato'); }
  };

  const del = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/products/${id}`);
    toast.success("O'chirildi"); load();
  };

  const fmt = n => new Intl.NumberFormat('uz-UZ').format(n);

  return (
    <div>
      <div className="page-header">
        <h2>💧 Mahsulotlar</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Mahsulot qo'shish</button>
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spinner" /></div>
          : list.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💧</div><p>Mahsulotlar yo'q</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Nomi</th><th>Kategoriya</th><th>Kelish narxi</th>
                    <th>Sotish narxi</th><th>Optom narxi</th><th>Amallar</th></tr>
                </thead>
                <tbody>
                  {list.map(p => (
                    <tr key={p._id}>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="badge badge-blue">{p.category}</span></td>
                      <td className="text-danger">{fmt(p.buyPrice)} so'm</td>
                      <td className="text-success">{fmt(p.sellPrice)} so'm</td>
                      <td>{p.wholesalePrice ? fmt(p.wholesalePrice) + ' so\'m' : '—'}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️</button>
                        {' '}
                        <button className="btn btn-danger btn-sm" onClick={() => del(p._id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editId ? 'Mahsulotni tahrirlash' : "Yangi mahsulot"}</h2>
              <button className="modal-close" onClick={close}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full">
                <label>Nomi *</label>
                <input className="form-control" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Masalan: Arzon suv 19L" />
              </div>
              <div className="form-group">
                <label>Kategoriya</label>
                <select className="form-control" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  {cats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Kelish narxi (so'm) *</label>
                <input className="form-control" type="number" value={form.buyPrice}
                  onChange={e => setForm({ ...form, buyPrice: e.target.value })} placeholder="5000" />
              </div>
              <div className="form-group">
                <label>Sotish narxi (so'm) *</label>
                <input className="form-control" type="number" value={form.sellPrice}
                  onChange={e => setForm({ ...form, sellPrice: e.target.value })} placeholder="7000" />
              </div>
              <div className="form-group">
                <label>Optom narxi (so'm)</label>
                <input className="form-control" type="number" value={form.wholesalePrice}
                  onChange={e => setForm({ ...form, wholesalePrice: e.target.value })} placeholder="6000" />
              </div>
              <div className="form-group full">
                <label>Tavsif</label>
                <textarea className="form-control" rows="2" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={close}>Bekor</button>
              <button className="btn btn-primary" onClick={save}>💾 Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
