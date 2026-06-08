import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, DollarSign, Clock, Truck, CreditCard, Award, Plus, X, CheckCircle } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { RFQ } from '../../types/real.types';

const SubmitQuote: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quoteData, setQuoteData] = useState({
    unitPrice: 0,
    leadTimeDays: 14,
    deliveryTerms: 'FOB Destination',
    paymentTerms: 'Net 30',
    qualityGuarantee: 'ISO 9001:2024 certified',
    certifications: ['ISO 9001', 'AS9100D'],
    notes: '',
  });
  const [newCert, setNewCert] = useState('');

  useEffect(() => {
    loadRFQ();
  }, [id]);

  const loadRFQ = async () => {
    try {
      const data = await realApi.getSupplierRFQById(id!);
      setRfq(data);
      setQuoteData(prev => ({
        ...prev,
        unitPrice: data.quantity ? Math.round(data.quantity * 5) / data.quantity : 0
      }));
    } catch (error) {
      console.error('Error loading RFQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (quoteData.unitPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    setSubmitting(true);
    try {
      await realApi.submitQuote(id!, quoteData);
      alert('Quote submitted successfully!');
      navigate('/supplier/quotes');
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Failed to submit quote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addCertification = () => {
    if (newCert && !quoteData.certifications.includes(newCert)) {
      setQuoteData({
        ...quoteData,
        certifications: [...quoteData.certifications, newCert]
      });
      setNewCert('');
    }
  };

  const removeCertification = (cert: string) => {
    setQuoteData({
      ...quoteData,
      certifications: quoteData.certifications.filter(c => c !== cert)
    });
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading RFQ details...</div>;
  if (!rfq) return <div style={{ padding: '40px', textAlign: 'center' }}>RFQ not found</div>;

  const totalPrice = rfq.quantity * quoteData.unitPrice;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/supplier/rfq')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#666', marginBottom: '24px', cursor: 'pointer' }}>
        <ChevronLeft size={20} /> Back to Available RFQs
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Submit Quote</h1>
        <p style={{ color: '#666' }}>RFQ: {rfq.title}</p>
      </div>

      {/* RFQ Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid #eef2f6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div><span style={{ fontSize: '12px', color: '#666' }}>Part Name</span><p style={{ fontWeight: '500' }}>{rfq.partName}</p></div>
          <div><span style={{ fontSize: '12px', color: '#666' }}>Quantity</span><p style={{ fontWeight: '500' }}>{rfq.quantity} {rfq.unit}</p></div>
          <div><span style={{ fontSize: '12px', color: '#666' }}>Required By</span><p style={{ fontWeight: '500' }}>{rfq.requiredBy}</p></div>
          <div><span style={{ fontSize: '12px', color: '#666' }}>Delivery Location</span><p>{rfq.deliveryLocation}</p></div>
          <div><span style={{ fontSize: '12px', color: '#666' }}>Payment Terms</span><p>{rfq.paymentTerms}</p></div>
          <div><span style={{ fontSize: '12px', color: '#666' }}>PPAP Level</span><p>{rfq.ppapLevel}</p></div>
        </div>
      </div>

      {/* Quote Form */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eef2f6' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Your Quote</h3>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Unit Price *</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} color="#666" />
            <input type="number" value={quoteData.unitPrice} onChange={(e) => setQuoteData({...quoteData, unitPrice: parseFloat(e.target.value)})} style={{ width: '200px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            <span style={{ color: '#666' }}>per unit</span>
          </div>
          <p style={{ fontSize: '13px', color: '#10b981', marginTop: '8px' }}>Total Price: ${totalPrice.toLocaleString()}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Lead Time</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#666" />
            <input type="number" value={quoteData.leadTimeDays} onChange={(e) => setQuoteData({...quoteData, leadTimeDays: parseInt(e.target.value)})} style={{ width: '100px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            <span>days</span>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Delivery Terms</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} color="#666" />
            <select value={quoteData.deliveryTerms} onChange={(e) => setQuoteData({...quoteData, deliveryTerms: e.target.value})} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '200px' }}>
              <option>FOB Destination</option>
              <option>FOB Shipping Point</option>
              <option>CIF</option>
              <option>EXW</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Payment Terms</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="#666" />
            <select value={quoteData.paymentTerms} onChange={(e) => setQuoteData({...quoteData, paymentTerms: e.target.value})} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '200px' }}>
              <option>Net 30</option>
              <option>Net 45</option>
              <option>Net 60</option>
              <option>50% Advance, 50% Net 30</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Quality Guarantee</label>
          <textarea value={quoteData.qualityGuarantee} onChange={(e) => setQuoteData({...quoteData, qualityGuarantee: e.target.value})} rows={2} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} placeholder="Describe your quality guarantees..." />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Certifications</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {quoteData.certifications.map(cert => (
              <span key={cert} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px', background: '#e8f0fe', borderRadius: '20px', fontSize: '13px' }}>
                <Award size={12} /> {cert}
                <button onClick={() => removeCertification(cert)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px' }}><X size={12} /></button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="Add certification (e.g., ISO 9001)" value={newCert} onChange={(e) => setNewCert(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
            <button onClick={addCertification} style={{ padding: '8px 16px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Plus size={16} /></button>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Notes (Optional)</label>
          <textarea value={quoteData.notes} onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})} rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} placeholder="Any additional information for the buyer..." />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={() => navigate('/supplier/rfq')} style={{ padding: '10px 24px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} style={{ padding: '10px 24px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Quote'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitQuote;
