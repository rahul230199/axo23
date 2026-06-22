import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatDate, formatCurrency } from '../../utils/formatters';

const SupplierQuotes: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadQuotes(); }, []);

  const loadQuotes = async () => {
    try { const data = await realApi.getSupplierQuotes(); setQuotes(data); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'accepted') return <CheckCircle size={16} color="#10b981" />;
    if (status === 'rejected') return <XCircle size={16} color="#ef4444" />;
    return <Clock size={16} color="#f59e0b" />;
  };

  if (loading) return <div>Loading your quotes...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>My Quotes</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Quotes you have submitted to buyers</p>
      {quotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px' }}>
          <FileText size={48} color="#94a3b8" />
          <p style={{ marginTop: '16px', color: '#64748b' }}>You haven't submitted any quotes yet.</p>
          <button onClick={() => navigate('/supplier/rfqs')} style={{ marginTop: '20px', padding: '10px 24px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>Browse RFQs</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {quotes.map((quote) => (
            <div key={quote.id} style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #eef2f6' }} className="hover-lift">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' }}>
                <div><strong>{quote.rfq_title || 'RFQ'}</strong><br/><span style={{ fontSize: '12px', color: '#64748b' }}>{quote.quote_number}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{getStatusIcon(quote.status)} <span style={{ fontWeight: '500' }}>{quote.status}</span></div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#2d3561', marginBottom: '12px' }}>{formatCurrency(quote.total_price, quote.currency)}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '12px', fontSize: '13px' }}>
                <div><strong>Lead Time:</strong> {quote.lead_time_days} days</div><div><strong>Delivery:</strong> {quote.delivery_terms}</div><div><strong>Payment:</strong> {quote.payment_terms}</div><div><strong>Submitted:</strong> {formatDate(quote.submitted_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default SupplierQuotes;
