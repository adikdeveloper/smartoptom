import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import logoImg from '../assets/logo.png';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/orders',    icon: '🛒', label: 'Buyurtmalar' },
  { to: '/customers', icon: '👥', label: 'Mijozlar' },
  { to: '/firms',     icon: '🏢', label: 'Firmalar' },
  { to: '/products',  icon: '💧', label: 'Mahsulotlar' },
  { to: '/stock',     icon: '🏭', label: 'Sklad' },
  { to: '/finance',   icon: '💰', label: 'Moliya' },
  { to: '/debts',     icon: '💳', label: 'Qarzdorliklar' },
  { to: '/reports',   icon: '📈', label: 'Hisobotlar' },
];

// ===== Sklad ogohlantirish modali =====
function StockWarning({ items, onClose, onGoStock }) {
  if (!items || items.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.3s ease',
        cursor: 'pointer',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`@keyframes fadeIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }`}</style>
      <div style={{
        background: 'linear-gradient(135deg, #0a1a0d, #0f2010)',
        border: '1px solid #c9a84c',
        borderTop: '3px solid #c9a84c',
        borderRadius: 16,
        width: '100%', maxWidth: 480,
        padding: 0,
        boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(201,168,76,0.1)',
        fontFamily: 'Inter, sans-serif',
      }}>
        {/* Header */}
        <div style={{
          padding: '22px 28px 18px',
          borderBottom: '1px solid #1a3a20',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: 12,
            background: 'rgba(220,38,38,0.15)',
            border: '1px solid rgba(220,38,38,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
            boxShadow: '0 0 20px rgba(220,38,38,0.2)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>⚠️</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#f0ebe0', marginBottom: 3 }}>
              Sklad Ogohlantirishi!
            </div>
            <div style={{ fontSize: 12, color: '#9aab96' }}>
              {items.length} ta mahsulot kam qoldi (≤ 100 ta)
            </div>
          </div>
        </div>

        {/* Mahsulotlar ro'yxati */}
        <div style={{ padding: '16px 28px', maxHeight: 280, overflowY: 'auto' }}>
          {items.map((item, i) => {
            const qty = item.quantity;
            const pct = Math.min((qty / 100) * 100, 100);
            const color = qty === 0 ? '#dc2626' : qty <= 20 ? '#ef4444' : qty <= 50 ? '#f59e0b' : '#c9a84c';
            return (
              <div key={i} style={{
                padding: '12px 14px',
                background: qty === 0 ? 'rgba(220,38,38,0.08)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${qty === 0 ? 'rgba(220,38,38,0.3)' : '#1a3a20'}`,
                borderRadius: 10,
                marginBottom: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#f0ebe0', fontSize: 14 }}>
                      {item.product?.name || '—'}
                    </span>
                    <span style={{ fontSize: 11, color: '#9aab96', marginLeft: 8 }}>
                      ({item.product?.category || '—'})
                    </span>
                  </div>
                  <span style={{
                    fontWeight: 800, fontSize: 16, color: color,
                    background: `${color}15`,
                    padding: '2px 12px', borderRadius: 20,
                    border: `1px solid ${color}30`,
                  }}>
                    {qty === 0 ? '❌ Tugagan' : `${qty} ta`}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 5, background: '#1a3a20', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: color,
                    borderRadius: 3, transition: 'width 0.5s',
                  }} />
                </div>
                <div style={{ fontSize: 10, color: '#4a6650', marginTop: 4 }}>
                  {qty === 0 ? 'Yangilash zarur!' : `${100 - qty} ta sotilishi mumkin`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px 24px',
          borderTop: '1px solid #1a3a20',
          display: 'flex', gap: 10,
        }}>
          <button
            onClick={onGoStock}
            style={{
              flex: 1, padding: '12px',
              background: 'linear-gradient(135deg, #c9a84c, #8a6d28)',
              color: '#0a0e06', border: 'none', borderRadius: 8,
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            🏭 Skladga o'tish
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px',
              background: 'transparent',
              color: '#9aab96', border: '1px solid #1a3a20',
              borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f0ebe0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9aab96'; }}
          >
            ✕ Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const now = new Date().toLocaleDateString('uz-UZ', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // ===== Har sahifa refresh bo'lganda sklad tekshiruvi =====
  useEffect(() => {
    const checkStock = async () => {
      try {
        const res = await api.get('/stock/low-stock');
        if (res.data && res.data.length > 0) {
          setLowStockItems(res.data);
          setShowWarning(true);
        }
      } catch (e) {
        // Backend ishlamasa — ogohlantirma
        console.warn('Sklad tekshirishda xato:', e.message);
      }
    };
    checkStock();
  }, []); // [] = faqat mount bo'lganda (ya'ni har refresh)

  return (
    <div className="layout">
      {/* ===== Global Sklad Ogohlantirishi ===== */}
      {showWarning && (
        <StockWarning
          items={lowStockItems}
          onClose={() => setShowWarning(false)}
          onGoStock={() => { setShowWarning(false); navigate('/stock'); }}
        />
      )}

      {/* ===== Mobile Sidebar Overlay ===== */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`} 
        onClick={() => setMobileMenuOpen(false)} 
      />

      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src={logoImg} alt="Smartoptom Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
          <div>
            <h2 style={{ fontSize: '18px', margin: 0, lineHeight: '1.2' }}>Smartoptom</h2>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>Boshqaruv Tizimi</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-label">Asosiy</span>
          {navItems.slice(0, 6).map((item) => (
            <NavLink key={item.to} to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="icon">{item.icon}</span>{item.label}
              {/* Sklad uchun qizil nuqta */}
              {item.to === '/stock' && lowStockItems.length > 0 && (
                <span style={{
                  marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%',
                  background: '#dc2626', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {lowStockItems.length}
                </span>
              )}
            </NavLink>
          ))}
          <span className="nav-label">Moliya</span>
          {navItems.slice(6).map((item) => (
            <NavLink key={item.to} to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="icon">{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sklad ogohlantirish mini banner */}
        {lowStockItems.length > 0 && (
          <button
            onClick={() => setShowWarning(true)}
            style={{
              margin: '0 10px 16px',
              padding: '10px 12px',
              background: 'rgba(220,38,38,0.12)',
              border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              width: 'calc(100% - 20px)',
            }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171' }}>
                {lowStockItems.length} ta mahsulot kam!
              </div>
              <div style={{ fontSize: 10, color: '#9aab96' }}>Ko'rish uchun bosing</div>
            </div>
          </button>
        )}
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            ☰
          </button>
          <h1 style={{ fontSize: '20px', margin: 0 }}>Smartoptom — Boshqaruv Tizimi</h1>
          <div className="topbar-right">
            {lowStockItems.length > 0 && (
              <button
                onClick={() => setShowWarning(true)}
                style={{
                  background: 'rgba(220,38,38,0.12)',
                  border: '1px solid rgba(220,38,38,0.3)',
                  color: '#f87171', borderRadius: 8,
                  padding: '6px 14px', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                ⚠️ {lowStockItems.length} ta sklad ogohlantirishi
              </button>
            )}
            <span className="badge-time">📅 {now}</span>
          </div>
        </header>
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
