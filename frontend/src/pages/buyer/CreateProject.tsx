import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send } from 'lucide-react';
import { realApi } from '../../services/realApi';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    target_quantity: 1,
    target_delivery_date: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.target_delivery_date) {
      alert('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const project = await realApi.createProject(formData);
      navigate(`/buyer/projects/${project.id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <button onClick={() => navigate('/buyer/projects')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#666', marginBottom: '24px', cursor: 'pointer' }}>
        <ChevronLeft size={20} /> Back to Projects
      </button>
      <div style={{ background: 'white', borderRadius: '20px', padding: '32px', border: '1px solid #eef2f6' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Create New Project</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Define the component you need to manufacture</p>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Project Name *</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Battery Enclosure" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Description</label>
          <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the component..." style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Industry</label>
            <select value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <option value="">Select...</option>
              <option value="EV">EV</option>
              <option value="Aerospace">Aerospace</option>
              <option value="Medical">Medical</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Target Quantity</label>
            <input type="number" value={formData.target_quantity} onChange={(e) => setFormData({ ...formData, target_quantity: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Target Delivery Date *</label>
            <input type="date" value={formData.target_delivery_date} onChange={(e) => setFormData({ ...formData, target_delivery_date: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={() => navigate('/buyer/projects')} style={{ padding: '10px 24px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 24px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} /> {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateProject;
