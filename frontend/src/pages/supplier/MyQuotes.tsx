import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatCurrency } from '../../utils/formatters';
import { Quote } from '../../types/real.types';

const MyQuotes: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const data = await realApi.getSupplierQuotes();
      setQuotes(data);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your quotes...</div>;

  const stats = {
    total: quotes.length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    pending: quotes.filter(q => q.status === 'pending').length,
    rejected: quotes.filter(q => q.status === 'rejected').length,
    totalValue: quotes.reduce((sum, q) => sum + q.totalPrice, 0),
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'accepted': return { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckCircle size={14} />, text: 'Accepted' };
      case 'pending': return { bg: '#fff3e0', color: '#e65100', icon: <Clock size={14} />, text: 'Pending' };
      case 'rejected': return { bg: '#fee2e2', color: '#dc2626', icon: <XCircle size={14} />, text: 'Rejected' };
      default: return { bg: '#e8f0fe', color: '#2d3561', icon: <AlertCircle size={14} />, text: 'Submitted' };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>My Quotes</h1>
        <p style={{ color: '#666' }}>Track all your submitted quotes and their status</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats.total}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Total Quotes</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{stats.accepted}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Accepted</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{stats.pending}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Pending</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{formatCurrency(stats.totalValue)}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Total Value</div>
        </div>
      </div>

      {quotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px solid #eef2f6' }}>
          <TrendingUp size={48} color="#94a3b8" />
          <h3 style={{ marginTop: '16px' }}>No quotes submitted yet</h3>
          <p style={{ color: '#666' }}>Browse available RFQs and submit your first quote</p>
          <button onClick={() => navigate('/supplier/rfq')} style={{ marginTop: '20px', padding: '10px 20px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Browse RFQs</button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eef2f6', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafbfc', borderBottom: '1px solid #eef2f6' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Quote #</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Title</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Customer</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '12px', color: '#666' }}>Amount</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => {
                const badge = getStatusBadge(quote.status);
                return (
                  <tr key={quote.id} style={{ borderBottom: '1px solid #eef2f6' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '500', color: '#2d3561' }}>{quote.quoteNumber}</td>
                    <td style={{ padding: '16px 20px' }}>RFQ-{quote.rfqId.slice(-4)}</td>
                    <td style={{ padding: '16px 20px', color: '#666' }}>{quote.supplierName}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(quote.totalPrice)}</td>
                    <td style={{ padding: '16px 20px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: badge.bg, color: badge.color }}>{badge.icon} {badge.text}</span></td>
                    <td style={{ padding: '16px 20px', color: '#666' }}>{new Date(quote.submittedAt).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 20px' }}><button onClick={() => navigate(`/supplier/rfq/${quote.rfqId}`)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Eye size={16} color="#666" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyQuotes;
