import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { realApi } from '../../services/realApi';

const SubmitQuote: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unitPrice, setUnitPrice] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('FOB');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [qualityGuarantee, setQualityGuarantee] = useState('');
  const [certifications, setCertifications] = useState('');
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRFQ = async () => {
      try {
        const data = await realApi.getSupplierRFQById(id!);
        setRfq(data);
      } catch (err) { setError('RFQ not found or unavailable'); } finally { setLoading(false); }
    };
    loadRFQ();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await realApi.submitQuote(id!, {
        unitPrice: parseFloat(unitPrice),
        leadTimeDays: parseInt(leadTimeDays),
        deliveryTerms,
        paymentTerms,
        qualityGuarantee,
        certifications,
        notes,
        currency
      });
      navigate('/supplier/quotes');
    } catch (err: any) { setError(err.message || 'Failed to submit quote'); } finally { setSubmitting(false); }
  };

  if (loading) return <div>Loading RFQ...</div>;
  if (error) return <div style={{ color: 'red', padding: '40px', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Submit Quote</h1>
      <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
        <p><strong>RFQ:</strong> {rfq.title}</p>
        <p><strong>Part:</strong> {rfq.part_name} | <strong>Qty:</strong> {rfq.quantity} {rfq.unit}</p>
        <p><strong>Required Delivery:</strong> {new Date(rfq.required_delivery_date).toLocaleDateString()}</p>
      </div>
      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {/* Unit Price & Currency */}
        <div style={{ marginBottom: '20px' }}>
          <label>Unit Price *</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}>
              <option value="USD">USD ($)</option><option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}><label>Lead Time (days) *</label><input type="number" value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
        <div style={{ marginBottom: '20px' }}><label>Delivery Terms</label><select value={deliveryTerms} onChange={(e) => setDeliveryTerms(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}><option>FOB</option><option>CIF</option><option>EXW</option><option>DDP</option></select></div>
        <div style={{ marginBottom: '20px' }}><label>Payment Terms</label><select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}><option>Net 30</option><option>Net 45</option><option>Net 60</option><option>50% advance</option></select></div>
        <div style={{ marginBottom: '20px' }}><label>Quality Guarantee</label><input type="text" value={qualityGuarantee} onChange={(e) => setQualityGuarantee(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
        <div style={{ marginBottom: '20px' }}><label>Certifications</label><input type="text" value={certifications} onChange={(e) => setCertifications(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
        <div style={{ marginBottom: '20px' }}><label>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
        {error && <div style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</div>}
        <button type="submit" disabled={submitting} style={{ width: '100%', padding: '12px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '40px', fontWeight: '600', cursor: 'pointer' }}>{submitting ? 'Submitting...' : 'Submit Quote'}</button>
      </form>
    </div>
  );
};
export default SubmitQuote;
