import { useState } from 'react';

export default function Firms() {
  return (
    <div>
      <div className="page-header">
        <h2>🏢 Firmalar</h2>
        <button className="btn btn-primary">+ Firma qo'shish</button>
      </div>
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <p>Firmalar bo'limi tez orada to'liq ishga tushadi...</p>
        </div>
      </div>
    </div>
  );
}
