import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Clock, MapPin, Package, DollarSign, Send, AlertCircle } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { RFQ } from '../../types/real.types';

const AvailableRFQs: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRFQs();
  }, []);

  const loadRFQs = async () => {
    try {
      const data = await realApi.getAvailableRFQs();
      setRfqs(data);
    } catch (error) {
      console.error('Error loading RFQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRFQs = rfqs.filter(rfq => 
    rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rfq.partName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading available RFQs...</div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Available RFQs</h1>
        <p style={{ color: '#666' }}>Browse and quote on RFQs from manufacturers</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 16px' }}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search RFQs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none' }} />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}>
          <option value="all">All RFQs</option>
          <option value="urgent">Urgent</option>
          <option value="normal">Normal</option>
        </select>
      </div>

      {filteredRFQs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px solid #eef2f6' }}>
          <AlertCircle size={48} color="#94a3b8" />
          <h3 style={{ marginTop: '16px' }}>No RFQs available</h3>
          <p style={{ color: '#666' }}>Check back later for new opportunities</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {filteredRFQs.map(rfq => (
            <div key={rfq.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{rfq.title}</h3>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: '#e8f0fe', color: '#2d3561' }}>Open</span>
              </div>
              <p style={{ color: '#666', marginBottom: '12px' }}>{rfq.partName}</p>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '13px', color: '#666' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Package size={14} /> {rfq.quantity} {rfq.unit}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Due: {rfq.requiredBy}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {rfq.deliveryLocation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #eef2f6' }}>
                <span style={{ fontWeight: '600', color: '#2d3561' }}>Payment: {rfq.paymentTerms}</span>
                <button onClick={() => navigate(`/supplier/rfq/${rfq.id}/quote`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  <Send size={14} /> Submit Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableRFQs;
