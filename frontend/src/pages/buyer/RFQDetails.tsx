import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, Clock, MapPin, CreditCard, Package, AlertCircle, Star, Truck, Building2, Mail, Phone, Award, TrendingUp, FileText, Send, X } from 'lucide-react';
import { useRFQ, useQuotes } from '../../hooks/useBuyerData';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';
import { buyerApi } from '../../services/buyerApi';

const RFQDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [poFormData, setPoFormData] = useState({
    poNumber: `PO-${Date.now()}`,
    deliveryDate: '',
    shippingTerms: 'FOB Destination',
    paymentTerms: 'Net 30',
    specialInstructions: '',
  });

  const { data: rfq, loading: rfqLoading } = useRFQ(id || '');
  const { data: quotes, loading: quotesLoading, refetch } = useQuotes(id || '');

  const handleAcceptQuote = (quote: any) => {
    setSelectedQuote(quote);
    setPoFormData({
      ...poFormData,
      deliveryDate: rfq?.requiredBy || '',
    });
    setShowCreatePOModal(true);
  };

  const handleCreatePO = async () => {
    if (!poFormData.deliveryDate) {
      alert('Please enter delivery date');
      return;
    }

    setAccepting(true);
    try {
      const po = await buyerApi.createPO({
        quoteId: selectedQuote.id,
        rfqId: id,
        poNumber: poFormData.poNumber,
        deliveryDate: poFormData.deliveryDate,
        shippingTerms: poFormData.shippingTerms,
        paymentTerms: poFormData.paymentTerms,
        specialInstructions: poFormData.specialInstructions,
        supplierId: selectedQuote.supplierId,
        supplierName: selectedQuote.supplierName,
        items: [{
          partName: rfq?.partName,
          quantity: rfq?.quantity,
          unitPrice: selectedQuote.unitPrice,
          totalPrice: selectedQuote.totalPrice
        }],
        totalAmount: selectedQuote.totalPrice
      });
      
      alert(`Purchase Order ${po.poNumber} created successfully!`);
      navigate(`/buyer/orders/${po.id}`);
    } catch (error) {
      alert('Error creating PO. Please try again.');
    } finally {
      setAccepting(false);
      setShowCreatePOModal(false);
      setSelectedQuote(null);
    }
  };

  const handleRejectQuote = async (quoteId: string, supplierName: string) => {
    if (!window.confirm(`Reject quote from ${supplierName}?`)) return;
    
    setRejecting(true);
    try {
      await buyerApi.rejectQuote(quoteId);
      alert('Quote rejected successfully.');
      refetch();
    } catch (error) {
      alert('Error rejecting quote.');
    } finally {
      setRejecting(false);
    }
  };

  if (rfqLoading || quotesLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading RFQ details...</div>;
  }

  if (!rfq) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>RFQ not found</div>;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <button onClick={() => navigate('/buyer/rfq')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6b7280', marginBottom: '20px', cursor: 'pointer' }}>
        <ChevronLeft size={20} /> Back to RFQs
      </button>

      {/* RFQ Info Card */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '28px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{rfq.title}</h1>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: rfq.status === 'open' ? '#d1fae5' : '#fef3c7', color: rfq.status === 'open' ? '#065f46' : '#92400e' }}>{rfq.status.toUpperCase()}</span>
              <span style={{ color: '#6b7280', fontSize: '13px' }}>#{rfq.rfqNumber}</span>
              <span style={{ color: '#6b7280', fontSize: '13px' }}>Created: {formatDate(rfq.createdAt)}</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px 24px', background: '#eff6ff', borderRadius: '20px' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>{rfq.quotesReceived}</div>
            <div style={{ fontSize: '12px', color: '#1e40af' }}>Quotes Received</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
            <Package size={18} color="#3b82f6" />
            <div><div style={{ fontSize: '11px', color: '#64748b' }}>Part</div><div style={{ fontWeight: '500' }}>{rfq.partName}</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
            <TrendingUp size={18} color="#10b981" />
            <div><div style={{ fontSize: '11px', color: '#64748b' }}>Quantity</div><div style={{ fontWeight: '500' }}>{formatNumber(rfq.quantity)} {rfq.unit}</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
            <Clock size={18} color="#f59e0b" />
            <div><div style={{ fontSize: '11px', color: '#64748b' }}>Required By</div><div style={{ fontWeight: '500' }}>{formatDate(rfq.requiredBy)}</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
            <MapPin size={18} color="#8b5cf6" />
            <div><div style={{ fontSize: '11px', color: '#64748b' }}>Delivery</div><div style={{ fontWeight: '500' }}>{rfq.deliveryLocation || 'TBD'}</div></div>
          </div>
        </div>

        {rfq.description && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Description</h4>
            <p style={{ fontSize: '14px', color: '#475569' }}>{rfq.description}</p>
          </div>
        )}
      </div>

      {/* Quotes Section */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>📊 Quotes from Suppliers</h2>

      {!quotes || quotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <AlertCircle size={48} color="#94a3b8" />
          <h3 style={{ marginTop: '16px' }}>No quotes received yet</h3>
          <p style={{ color: '#64748b' }}>Suppliers are reviewing your RFQ. You'll be notified when quotes arrive.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {quotes.map((quote: any) => (
            <div key={quote.id} style={{ background: 'white', borderRadius: '20px', border: '2px solid #e2e8f0', padding: '24px', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px' }}>{quote.supplierName.charAt(0)}</div>
                  <div><h3 style={{ fontWeight: '700' }}>{quote.supplierName}</h3><div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><Star size={12} fill="#f59e0b" /> {quote.supplierRating} rating</div></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb' }}>{formatCurrency(quote.totalPrice)}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Total Price</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                <div><span style={{ fontSize: '11px', color: '#64748b' }}>Unit Price</span><div style={{ fontWeight: '600' }}>{formatCurrency(quote.unitPrice)}</div></div>
                <div><span style={{ fontSize: '11px', color: '#64748b' }}>Lead Time</span><div style={{ fontWeight: '600' }}>{quote.leadTimeDays} days</div></div>
                <div><span style={{ fontSize: '11px', color: '#64748b' }}>Delivery</span><div style={{ fontWeight: '600' }}>{quote.deliveryTerms}</div></div>
                <div><span style={{ fontSize: '11px', color: '#64748b' }}>Payment</span><div style={{ fontWeight: '600' }}>{quote.paymentTerms}</div></div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Certifications:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {quote.certifications.map((cert: string, idx: number) => (<span key={idx} style={{ fontSize: '10px', padding: '2px 8px', background: '#f1f5f9', borderRadius: '12px' }}>{cert}</span>))}
                </div>
              </div>

              {quote.qualityGuarantee && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', background: '#ecfdf5', padding: '8px 12px', borderRadius: '10px', marginBottom: '16px' }}>
                  <Award size={14} /> {quote.qualityGuarantee}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => handleAcceptQuote(quote)} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <FileText size={16} /> Create PO
                </button>
                <button onClick={() => handleRejectQuote(quote.id, quote.supplierName)} disabled={rejecting} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#ef4444', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create PO Modal */}
      {showCreatePOModal && selectedQuote && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setShowCreatePOModal(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '24px', padding: '32px', width: '500px', maxWidth: '90%', zIndex: 1000 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Create Purchase Order</h2>
              <button onClick={() => setShowCreatePOModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <p><strong>Supplier:</strong> {selectedQuote.supplierName}</p>
              <p><strong>Quote Amount:</strong> {formatCurrency(selectedQuote.totalPrice)}</p>
              <p><strong>Part:</strong> {rfq?.partName}</p>
              <p><strong>Quantity:</strong> {rfq?.quantity} {rfq?.unit}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>PO Number *</label>
              <input type="text" value={poFormData.poNumber} onChange={(e) => setPoFormData({ ...poFormData, poNumber: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Delivery Date *</label>
              <input type="date" value={poFormData.deliveryDate} onChange={(e) => setPoFormData({ ...poFormData, deliveryDate: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Shipping Terms</label>
              <select value={poFormData.shippingTerms} onChange={(e) => setPoFormData({ ...poFormData, shippingTerms: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <option>FOB Destination</option>
                <option>FOB Shipping Point</option>
                <option>CIF</option>
                <option>EXW</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Payment Terms</label>
              <select value={poFormData.paymentTerms} onChange={(e) => setPoFormData({ ...poFormData, paymentTerms: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <option>Net 30</option>
                <option>Net 45</option>
                <option>Net 60</option>
                <option>50% Advance, 50% Net 30</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Special Instructions</label>
              <textarea rows={3} value={poFormData.specialInstructions} onChange={(e) => setPoFormData({ ...poFormData, specialInstructions: e.target.value })} placeholder="Any special instructions for the supplier..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowCreatePOModal(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreatePO} disabled={accepting} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Send size={16} /> {accepting ? 'Creating...' : 'Create PO'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RFQDetails;
