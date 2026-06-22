import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Search, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatDate, formatCurrency } from '../../utils/formatters';

const MyQuotes: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
  const [showRFQModal, setShowRFQModal] = useState(false);
  const [loadingRFQ, setLoadingRFQ] = useState(false);

  const loadQuotes = async () => {
    try {
      setError(null);
      const data = await realApi.getSupplierQuotes();
      setQuotes(data || []);
    } catch (err: any) {
      console.error('Error loading quotes:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load quotes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadQuotes(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadQuotes();
  };

  const openRFQModal = async (rfqId: string) => {
    setLoadingRFQ(true);
    setShowRFQModal(true);
    try {
      const data = await realApi.getRFQById(rfqId);
      setSelectedRFQ(data);
    } catch (err: any) {
      alert('Failed to load RFQ details');
      setShowRFQModal(false);
    } finally {
      setLoadingRFQ(false);
    }
  };

  const filtered = quotes.filter(q =>
    q.rfq_title?.toLowerCase().includes(search.toLowerCase()) ||
    q.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
    q.supplier_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      'pending': { bg: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)', color: '#92400e', icon: <Clock size={14} />, label: 'Pending' },
      'accepted': { bg: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 100%)', color: '#064e3b', icon: <CheckCircle size={14} />, label: 'Accepted' },
      'rejected': { bg: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)', color: '#7f1d1d', icon: <XCircle size={14} />, label: 'Rejected' },
    };
    return statusMap[status] || { bg: '#e2e8f0', color: '#475569', icon: <AlertCircle size={14} />, label: status };
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your quotes...</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', background: 'linear-gradient(135deg, #1e293b 0%, #2d3561 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Quotes</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Track all your submitted quotes</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '40px', cursor: 'pointer' }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '40px', padding: '8px 16px', maxWidth: '400px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search by RFQ title, quote number, or supplier..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }} />
        </div>
      </div>

      {error && <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '16px', color: '#dc2626', marginBottom: '24px' }}>{error}</div>}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px solid #eef2f6' }}>
          <FileText size={48} color="#94a3b8" />
          <p style={{ marginTop: '16px', color: '#64748b' }}>No quotes found{search ? ' matching your search' : ''}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
          {filtered.map((quote) => {
            const status = getStatusBadge(quote.status);
            return (
              <div key={quote.id} style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} className="hover-lift">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{quote.rfq_title || 'RFQ'}</h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{quote.quote_number}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '40px', background: status.bg, color: status.color, fontSize: '12px', fontWeight: '500' }}>
                    {status.icon} {status.label}
                  </div>
                </div>

                <div style={{ fontSize: '28px', fontWeight: '700', color: '#2d3561', marginBottom: '12px' }}>{formatCurrency(quote.total_price, quote.currency)}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                  <div><strong>Unit Price:</strong> {formatCurrency(quote.unit_price, quote.currency)}</div>
                  <div><strong>Lead Time:</strong> {quote.lead_time_days} days</div>
                  <div><strong>Delivery:</strong> {quote.delivery_terms}</div>
                  <div><strong>Payment:</strong> {quote.payment_terms}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Submitted {formatDate(quote.submitted_at)}</div>

                <button onClick={() => openRFQModal(quote.rfq_id)} style={{ width: '100%', padding: '10px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px' }} className="hover-lift">
                  <Eye size={16} /> View RFQ
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* RFQ Modal */}
      {showRFQModal && selectedRFQ && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflow: 'auto', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '32px', padding: '32px', width: '800px', maxWidth: '90%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{selectedRFQ.title}</h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>{selectedRFQ.rfq_number}</p>
              </div>
              <button onClick={() => setShowRFQModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px' }} className="hover-scale"><X size={24} color="#64748b" /></button>
            </div>

            {loadingRFQ ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '16px' }}>
                  <div><strong>Part Name:</strong> {selectedRFQ.part_name}</div>
                  <div><strong>Part Number:</strong> {selectedRFQ.part_number || '—'}</div>
                  <div><strong>Quantity:</strong> {selectedRFQ.quantity} {selectedRFQ.unit}</div>
                  <div><strong>PPAP Level:</strong> {selectedRFQ.ppap_level || '—'}</div>
                  <div><strong>Required Delivery:</strong> {formatDate(selectedRFQ.required_delivery_date)}</div>
                  <div><strong>Required By:</strong> {formatDate(selectedRFQ.required_by)}</div>
                  <div><strong>Delivery Location:</strong> {selectedRFQ.delivery_location || '—'}</div>
                  <div><strong>Payment Terms:</strong> {selectedRFQ.payment_terms || '—'}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Status:</strong> <span style={{ padding: '2px 12px', borderRadius: '20px', background: selectedRFQ.status === 'open' ? '#d1fae5' : '#fef3c7', color: selectedRFQ.status === 'open' ? '#065f46' : '#92400e' }}>{selectedRFQ.status}</span></div>
                </div>
                {selectedRFQ.description && <div style={{ marginBottom: '16px' }}><strong>Description:</strong><p style={{ color: '#475569', marginTop: '4px' }}>{selectedRFQ.description}</p></div>}
                {selectedRFQ.quality_requirements && <div style={{ marginBottom: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '12px' }}><strong>Quality Requirements:</strong><p style={{ color: '#475569', marginTop: '4px' }}>{selectedRFQ.quality_requirements}</p></div>}
                {selectedRFQ.special_instructions && <div style={{ marginBottom: '16px', padding: '12px', background: '#eff6ff', borderRadius: '12px' }}><strong>Special Instructions:</strong><p style={{ color: '#475569', marginTop: '4px' }}>{selectedRFQ.special_instructions}</p></div>}
                {selectedRFQ.special_requirements && <div style={{ marginBottom: '24px', padding: '12px', background: '#fffbeb', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}><strong>Special Requirements:</strong><p style={{ color: '#475569', marginTop: '4px' }}>{selectedRFQ.special_requirements}</p></div>}
              </>
            )}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRFQModal(false)} style={{ padding: '8px 24px', background: '#e2e8f0', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 20px -12px rgba(0,0,0,0.15); }
        .hover-scale { transition: transform 0.2s ease; }
        .hover-scale:hover { transform: scale(1.02); }
      `}</style>
    </div>
  );
};
export default MyQuotes;
