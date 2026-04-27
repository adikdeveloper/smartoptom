import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const empty = { name: '', phone: '+998-', address: '', company: '', type: 'oddiy', notes: '' };

// +998-90-123-45-67 formatiga o'tkazuvchi funksiya
const formatPhone = (raw) => {
  // Faqat raqamlarni olish
  let digits = raw.replace(/\D/g, '');
  // Agar 998 bilan boshlansa, olib tashlash
  if (digits.startsWith('998')) digits = digits.slice(3);
  // Max 9 ta raqam (operator + nomer)
  digits = digits.slice(0, 9);
  // Formatlash: +998-XX-XXX-XX-XX
  let result = '+998';
  if (digits.length > 0) result += '-' + digits.slice(0, 2);
  if (digits.length > 2) result += '-' + digits.slice(2, 5);
  if (digits.length > 5) result += '-' + digits.slice(5, 7);
  if (digits.length > 7) result += '-' + digits.slice(7, 9);
  return result;
};

export default function Customers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/customers', { params: { search } });
      setList(r.data);
    } catch { toast.error('Yuklashda xato'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setForm({ ...empty, phone: '+998-' }); setEditId(null); setModal(true); };
  const openEdit = (c) => { setForm(c); setEditId(c._id); setModal(true); };

  const handlePhone = (val) => {
    const formatted = formatPhone(val);
    setForm(prev => ({ ...prev, phone: formatted }));
  };
  const close = () => setModal(false);

  const save = async () => {
    try {
      if (editId) { await api.put(`/customers/${editId}`, form); toast.success('Yangilandi'); }
      else { await api.post('/customers', form); toast.success("Mijoz qo'shildi"); }
      close(); load();
    } catch { toast.error('Xato yuz berdi'); }
  };

  const del = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/customers/${id}`);
    toast.success("O'chirildi");
    load();
  };

  const typeBadge = (t) => ({
    oddiy: 'badge-gray', vip: 'badge-yellow', ulgurji: 'badge-blue',
  })[t] || 'badge-gray';

  return (
    <div>
      <div className="page-header">
        <h2>👥 Mijozlar</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Mijoz qo'shish</button>
      </div>

      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Ism yoki telefon..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" /> Yuklanmoqda...</div>
        ) : list.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">👥</div><p>Mijozlar yo'q</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Ism</th><th>Telefon</th><th>Kompaniya</th><th>Turi</th>
                  <th>Qarzdorlik</th><th>Amallar</th></tr>
              </thead>
              <tbody>
                {list.map(c => (
                  <tr key={c._id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.phone}</td>
                    <td>{c.company || '—'}</td>
                    <td><span className={`badge ${typeBadge(c.type)}`}>{c.type}</span></td>
                    <td className={c.debt > 0 ? 'text-danger' : 'text-success'}>
                      {new Intl.NumberFormat('uz-UZ').format(c.debt)} so'm
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>✏️</button>
                      {' '}
                      <button className="btn btn-danger btn-sm" onClick={() => del(c._id)}>🗑️</button>
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
              <h2>{editId ? 'Mijozni tahrirlash' : "Yangi mijoz qo'shish"}</h2>
              <button className="modal-close" onClick={close}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Ism *</label>
                <input className="form-control" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ism Familiya" />
              </div>
              <div className="form-group">
                <label>Telefon *</label>
                <input
                  className="form-control"
                  value={form.phone}
                  onChange={e => handlePhone(e.target.value)}
                  onFocus={e => { if (!form.phone || form.phone === '') handlePhone(''); }}
                  placeholder="+998-90-123-45-67"
                  maxLength={17}
                />
              </div>
              <div className="form-group">
                <label>Kompaniya</label>
                <input className="form-control" value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Kompaniya nomi" />
              </div>
              <div className="form-group">
                <label>Turi</label>
                <select className="form-control" value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="oddiy">Oddiy</option>
                  <option value="vip">VIP</option>
                  <option value="ulgurji">Ulgurji</option>
                </select>
              </div>
              <div className="form-group full">
                <label>Manzil</label>
                <input className="form-control" value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Shahar, ko'cha..." />
              </div>
              <div className="form-group full">
                <label>Izoh</label>
                <textarea className="form-control" rows="2" value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Qo'shimcha ma'lumot..." />
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
