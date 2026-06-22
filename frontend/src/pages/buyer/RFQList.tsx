import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Clock, AlertCircle } from 'lucide-react';
import { useRFQs } from '../../hooks/useBuyerData';
import { formatDate, formatNumber } from '../../utils/formatters';

const RFQList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: rfqs, loading } = useRFQs();

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  const filteredRFQs = (rfqs || []).filter((rfq: any) =>
    rfq.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rfq.rfq_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Request for Quotes</h1>
          <p style={{ color: '#6b7280' }}>Manage and track all your sourcing requests</p>
        </div>
        <button onClick={() => navigate('/buyer/rfq/create')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={18} /> Create New RFQ
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 16px' }}>
          <Search size={18} />
          <input type="text" placeholder="Search by title or RFQ number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
        {filteredRFQs.map((rfq: any) => (
          <div key={rfq.id} onClick={() => navigate(`/buyer/rfq/${rfq.id}`)} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '600', color: '#6b7280', fontSize: '13px' }}>{rfq.rfq_number}</span>
              <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', background: rfq.status === 'open' ? '#d1fae5' : '#fef3c7', color: rfq.status === 'open' ? '#065f46' : '#92400e' }}>{rfq.status?.toUpperCase() || 'DRAFT'}</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{rfq.title}</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>{rfq.part_name} • Qty: {formatNumber(rfq.quantity)} {rfq.unit}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}><Clock size={14} /> {rfq.quotes_received || 0} quotes</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}><AlertCircle size={14} /> Due: {formatDate(rfq.required_by)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RFQList;
