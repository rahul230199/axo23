import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { realApi } from '../../services/realApi';

const CreateRFQ: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectName, setProjectName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    part_name: '',
    part_number: '',
    quantity: '',
    unit: 'pcs',
    required_delivery_date: '',
    delivery_location: '',
    payment_terms: 'Net 30',
    ppap_level: 'Level 1',
    quality_requirements: '',
    special_instructions: '',
    special_requirements: '',
  });

  useEffect(() => {
    if (!projectId || projectId === 'undefined' || projectId === 'null') {
      navigate('/buyer/projects');
      return;
    }
    realApi.getProjectById(projectId)
      .then(data => setProjectName(data.name))
      .catch(() => {});
  }, [projectId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        project_id: projectId,
        quantity: parseFloat(formData.quantity),
        required_by: null, // explicitly set to null
      };
      console.log('Submitting RFQ:', payload);
      await realApi.createRFQ(payload);
      navigate(`/buyer/projects/${projectId}`);
    } catch (err: any) {
      console.error('RFQ creation error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create RFQ');
    } finally {
      setLoading(false);
    }
  };

  const units = ['pcs', 'kg', 'm', 'ft', 'L', 'box', 'set'];
  const paymentOptions = ['Net 30', 'Net 45', 'Net 60', '50% advance', 'COD'];
  const ppapLevels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      <button
        onClick={() => navigate(`/buyer/projects/${projectId}`)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '24px' }}
      >
        <ArrowLeft size={18} /> Back to Project
      </button>

      <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #eef2f6' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Create RFQ</h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Project: <strong>{projectName || 'Loading...'}</strong>
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>RFQ Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Part Name *</label>
              <input type="text" name="part_name" value={formData.part_name} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Part Number</label>
              <input type="text" name="part_number" value={formData.part_number} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Quantity *</label>
              <input type="number" step="0.01" name="quantity" value={formData.quantity} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Unit</label>
              <select name="unit" value={formData.unit} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Required Delivery Date *</label>
              <input type="date" name="required_delivery_date" value={formData.required_delivery_date} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Delivery Location</label>
              <input type="text" name="delivery_location" value={formData.delivery_location} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Payment Terms</label>
              <select name="payment_terms" value={formData.payment_terms} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                {paymentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>PPAP Level</label>
              <select name="ppap_level" value={formData.ppap_level} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                {ppapLevels.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', fontFamily: 'inherit' }} />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Quality Requirements</label>
            <textarea name="quality_requirements" value={formData.quality_requirements} onChange={handleChange} rows={2} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', fontFamily: 'inherit' }} />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Special Instructions</label>
            <textarea name="special_instructions" value={formData.special_instructions} onChange={handleChange} rows={2} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', fontFamily: 'inherit' }} />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Special Requirements</label>
            <textarea name="special_requirements" value={formData.special_requirements} onChange={handleChange} rows={2} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => navigate(`/buyer/projects/${projectId}`)} style={{ padding: '10px 24px', background: '#e2e8f0', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: '10px 32px', background: 'linear-gradient(135deg, #2d3561, #1e293b)', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={18} /> {loading ? 'Creating...' : 'Create RFQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRFQ;
