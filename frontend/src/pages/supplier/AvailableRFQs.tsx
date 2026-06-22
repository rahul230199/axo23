import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, RefreshCw, AlertCircle, X, Eye } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatDate } from '../../utils/formatters';

const AvailableRFQs: React.FC = () => {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedQuoteIds, setSubmittedQuoteIds] = useState<Set<string>>(new Set());
  const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    unitPrice: '',
    leadTimeDays: '',
    deliveryTerms: 'FOB',
    paymentTerms: 'Net 30',
    qualityGuarantee: '',
    certifications: '',
    notes: '',
    currency: 'USD'
  });

  const loadRFQs = async () => {
    try {
      setError(null);
      const rfqsData = await realApi.getSupplierRFQs();
      setRfqs(rfqsData || []);
      const quotesData = await realApi.getSupplierQuotes();
      const quotedIds = new Set<string>((quotesData || []).map((q: any) => q.rfq_id));
      setSubmittedQuoteIds(quotedIds);
    } catch (err: any) {
      console.error('Error loading RFQs:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load RFQs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRFQs();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRFQs();
  };

  const openQuoteModal = (rfq: any) => {
    setSelectedRFQ(rfq);
    setFormData({
      unitPrice: '',
      leadTimeDays: '',
      deliveryTerms: 'FOB',
      paymentTerms: 'Net 30',
      qualityGuarantee: '',
      certifications: '',
      notes: '',
      currency: 'USD'
    });
    setShowQuoteModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRFQ) return;
    setSubmitting(true);
    try {
      await realApi.submitQuote(selectedRFQ.id, {
        unitPrice: parseFloat(formData.unitPrice),
        leadTimeDays: parseInt(formData.leadTimeDays),
        deliveryTerms: formData.deliveryTerms,
        paymentTerms: formData.paymentTerms,
        qualityGuarantee: formData.qualityGuarantee,
        certifications: formData.certifications,
        notes: formData.notes,
        currency: formData.currency
      });
      setShowQuoteModal(false);
      await loadRFQs();
      alert('Quote submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading available RFQs...</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', background: 'linear-gradient(135deg, #1e293b 0%, #2d3561 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Available RFQs</h1>
          <p style={{ color: '#64748b' }}>Browse and quote on manufacturing requests from buyers</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '40px', cursor: 'pointer' }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {error && <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '16px', color: '#dc2626', marginBottom: '24px' }}>{error}</div>}

      {rfqs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px solid #eef2f6' }}>
          <FileText size={48} color="#94a3b8" />
          <p style={{ marginTop: '16px', color: '#64748b' }}>No RFQs available at the moment</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          {rfqs.map((rfq: any) => (
            <div key={rfq.id} style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} className="hover-lift">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{rfq.title}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{rfq.rfq_number}</span>
                </div>
                {submittedQuoteIds.has(rfq.id) ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px', background: '#d1fae5', color: '#065f46', borderRadius: '20px', fontSize: '12px' }}><CheckCircle size={14} /> Quoted</span>
                ) : (
                  <span style={{ padding: '4px 12px', background: '#fef3c7', color: '#92400e', borderRadius: '20px', fontSize: '12px' }}>Open</span>
                )}
              </div>
              <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>{rfq.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '13px' }}>
                <div><strong>Part:</strong> {rfq.part_name}</div>
                <div><strong>Qty:</strong> {rfq.quantity} {rfq.unit}</div>
                <div><strong>Project:</strong> {rfq.project_name}</div>
                <div><strong>Delivery:</strong> {formatDate(rfq.required_delivery_date)}</div>
              </div>
              <button
                onClick={() => openQuoteModal(rfq)}
                disabled={submittedQuoteIds.has(rfq.id)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: submittedQuoteIds.has(rfq.id) ? '#9ca3af' : '#2d3561',
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  fontWeight: '600',
                  cursor: submittedQuoteIds.has(rfq.id) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover-lift"
              >
                {submittedQuoteIds.has(rfq.id) ? 'Quote Submitted' : 'Submit Quote'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Submit Quote Modal */}
      {showQuoteModal && selectedRFQ && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflow: 'auto', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '32px', padding: '32px', width: '650px', maxWidth: '90%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Submit Quote</h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>{selectedRFQ.title} • {selectedRFQ.part_name}</p>
              </div>
              <button onClick={() => setShowQuoteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px' }} className="hover-scale"><X size={24} color="#64748b" /></button>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '16px', marginBottom: '24px' }}>
              <div><strong>Quantity:</strong> {selectedRFQ.quantity} {selectedRFQ.unit}</div>
              <div><strong>Required Delivery:</strong> {formatDate(selectedRFQ.required_delivery_date)}</div>
            </div>

            <form onSubmit={handleSubmitQuote}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Unit Price *</label>
                  <input type="number" step="0.01" name="unitPrice" value={formData.unitPrice} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Currency</label>
                  <select name="currency" value={formData.currency} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Lead Time (days) *</label>
                <input type="number" name="leadTimeDays" value={formData.leadTimeDays} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Delivery Terms</label>
                  <select name="deliveryTerms" value={formData.deliveryTerms} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <option>FOB</option><option>CIF</option><option>EXW</option><option>DDP</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Payment Terms</label>
                  <select name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <option>Net 30</option><option>Net 45</option><option>Net 60</option><option>50% advance</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Quality Guarantee</label>
                <input type="text" name="qualityGuarantee" value={formData.qualityGuarantee} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Certifications</label>
                <input type="text" name="certifications" value={formData.certifications} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button onClick={() => setShowQuoteModal(false)} type="button" style={{ padding: '8px 20px', background: '#e2e8f0', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '8px 24px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: '500' }}>
                  {submitting ? 'Submitting...' : 'Submit Quote'}
                </button>
              </div>
            </form>
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
export default AvailableRFQs;
