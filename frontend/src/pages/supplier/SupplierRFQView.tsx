import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatDate, formatNumber } from '../../utils/formatters';

const SupplierRFQView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRFQ = async () => {
      try {
        const data = await realApi.getSupplierRFQById(id!);
        setRfq(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadRFQ();
  }, [id]);

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;
  if (!rfq) return <div style={{ padding: '40px' }}>RFQ not found</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <button onClick={() => navigate('/supplier/quotes')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#666', marginBottom: '24px', cursor: 'pointer' }}>
        <ChevronLeft size={20} /> Back to My Quotes
      </button>
      <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #eef2f6' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>{rfq.title}</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>{rfq.rfq_number}</p>
        <div style={{ marginBottom: '24px' }}>
          <h3>Description</h3>
          <p>{rfq.description || 'No description provided'}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
          <div><strong>Part:</strong> {rfq.part_name}</div>
          <div><strong>Quantity:</strong> {formatNumber(rfq.quantity)} {rfq.unit}</div>
          <div><strong>Required By:</strong> {formatDate(rfq.required_by)}</div>
          <div><strong>Delivery Location:</strong> {rfq.delivery_location || 'Not specified'}</div>
          <div><strong>Payment Terms:</strong> {rfq.payment_terms}</div>
          <div><strong>PPAP Level:</strong> {rfq.ppap_level}</div>
        </div>
      </div>
    </div>
  );
};

export default SupplierRFQView;
