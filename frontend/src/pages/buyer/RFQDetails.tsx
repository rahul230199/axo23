import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, MessageSquare, Package, CheckCircle, Clock, AlertCircle, Truck, X } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatDate, formatCurrency } from '../../utils/formatters';

const RFQDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [creatingPO, setCreatingPO] = useState(false);

  useEffect(() => { loadRFQ(); }, [id]);

  const loadRFQ = async () => {
    try {
      const data = await realApi.getRFQById(id!);
      setRfq(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleReviewQuote = (quote: any) => {
    setSelectedQuote(quote);
    setShowReviewModal(true);
  };

  const handleCreatePO = async () => {
    if (!selectedQuote) return;
    setCreatingPO(true);
    try {
      const newPO = await realApi.acceptQuote(selectedQuote.id);
      setShowReviewModal(false);
      // Reload RFQ to update quote status (button will disappear)
      await loadRFQ();
      // Navigate to the new PO details page
      navigate(`/buyer/orders/${newPO.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create purchase order');
    } finally {
      setCreatingPO(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!rfq) return <div>RFQ not found</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <button onClick={() => navigate('/buyer/rfq')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', marginBottom: '24px', cursor: 'pointer' }}>
        <ChevronLeft size={20} /> Back to RFQs
      </button>

      <div style={{ background: 'white', borderRadius: '28px', padding: '28px', marginBottom: '28px', border: '1px solid #eef2f6', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>{rfq.title}</h1>
        <p style={{ color: '#64748b', marginBottom: '16px' }}>{rfq.rfq_number}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '16px', marginBottom: '24px' }}>
          <div><strong>Part:</strong> {rfq.part_name}</div>
          <div><strong>Quantity:</strong> {rfq.quantity} {rfq.unit}</div>
          <div><strong>Required Delivery:</strong> {formatDate(rfq.required_delivery_date)}</div>
          <div><strong>Status:</strong> <span style={{ padding: '2px 12px', borderRadius: '20px', background: rfq.status === 'open' ? '#d1fae5' : '#fef3c7', color: rfq.status === 'open' ? '#065f46' : '#92400e' }}>{rfq.status}</span></div>
        </div>
        <p style={{ color: '#475569' }}>{rfq.description}</p>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Quotes Received ({rfq.quotes?.length || 0})</h2>
      {rfq.quotes?.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '24px' }}>No quotes yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {rfq.quotes.map((quote: any) => {
            const isAccepted = quote.status === 'accepted';
            return (
              <div key={quote.id} style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6' }} className="hover-lift">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <div><strong>{quote.supplier_name}</strong> <span style={{ fontSize: '13px', color: '#64748b' }}>{quote.quote_number}</span></div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#2d3561' }}>{formatCurrency(quote.total_price, quote.currency)}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '12px', marginBottom: '20px', fontSize: '14px' }}>
                  <div><strong>Unit Price:</strong> {formatCurrency(quote.unit_price, quote.currency)}</div>
                  <div><strong>Lead Time:</strong> {quote.lead_time_days} days</div>
                  <div><strong>Delivery:</strong> {quote.delivery_terms}</div>
                  <div><strong>Payment:</strong> {quote.payment_terms}</div>
                </div>
                {isAccepted ? (
                  <div style={{ padding: '8px 24px', background: '#d1fae5', color: '#065f46', borderRadius: '40px', textAlign: 'center', fontWeight: '500' }}>
                    <CheckCircle size={16} style={{ display: 'inline', marginRight: '8px' }} /> PO Created
                  </div>
                ) : (
                  <button onClick={() => handleReviewQuote(quote)} style={{ padding: '8px 24px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: '500' }} className="hover-lift">
                    Review & Create PO
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review PO Modal */}
      {showReviewModal && selectedQuote && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflow: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Review Purchase Order</h3>
              <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <div style={{ marginBottom: '16px' }}><strong>Supplier:</strong> {selectedQuote.supplier_name}</div>
            <div style={{ marginBottom: '16px' }}><strong>Items:</strong> {rfq.part_name} – {rfq.quantity} {rfq.unit}</div>
            <div style={{ marginBottom: '16px' }}><strong>Total Amount:</strong> {formatCurrency(selectedQuote.total_price, selectedQuote.currency)}</div>
            <div style={{ marginBottom: '16px' }}><strong>Delivery Date:</strong> {formatDate(rfq.required_delivery_date)}</div>
            <div style={{ marginBottom: '16px' }}><strong>Payment Terms:</strong> {selectedQuote.payment_terms}</div>
            <div style={{ marginBottom: '16px' }}><strong>Lead Time:</strong> {selectedQuote.lead_time_days} days</div>
            <div style={{ marginBottom: '16px' }}><strong>Notes:</strong> {selectedQuote.notes || '—'}</div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#475569' }}>By clicking "Confirm & Create PO", you agree to the terms of this purchase order. This action cannot be undone.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowReviewModal(false)} style={{ padding: '10px 24px', background: '#e2e8f0', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreatePO} disabled={creatingPO} style={{ padding: '10px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>
                {creatingPO ? 'Creating...' : 'Confirm & Create PO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RFQDetails;
