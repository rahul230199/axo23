import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Upload, CheckCircle, Send, X, FileText } from 'lucide-react';

const CreateRFQ: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredBy: '',
    deliveryLocation: '',
    paymentTerms: 'Net 30',
    ppapLevel: 'Level 1',
    qualityRequirements: '',
    specialInstructions: '',
  });

  const [items, setItems] = useState([
    { id: '1', partName: '', partNumber: '', quantity: 1, unit: 'pcs', description: '', drawings: [] as File[] }
  ]);

  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), partName: '', partNumber: '', quantity: 1, unit: 'pcs', description: '', drawings: [] }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const handleFileUpload = (itemId: string, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setItems(items.map(item => 
      item.id === itemId ? { ...item, drawings: [...item.drawings, ...fileArray] } : item
    ));
  };

  const removeFile = (itemId: string, fileIndex: number) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, drawings: item.drawings.filter((_, i) => i !== fileIndex) } : item
    ));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Save RFQ with documents
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Store documents in localStorage (will be picked up by Documents page)
    const existingDocs = JSON.parse(localStorage.getItem('documents') || '[]');
    items.forEach(item => {
      item.drawings.forEach(file => {
        existingDocs.push({
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: 'drawing',
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'Current User',
          entityId: `rfq_${Date.now()}`,
          entityType: 'rfq'
        });
      });
    });
    localStorage.setItem('documents', JSON.stringify(existingDocs));
    
    setIsSubmitting(false);
    navigate('/buyer/rfq');
  };

  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Part Details' },
    { number: 3, title: 'Requirements' },
    { number: 4, title: 'Submit' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate('/buyer/rfq')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#666', marginBottom: '24px', cursor: 'pointer' }}>
        <ChevronLeft size={20} /> Back to RFQs
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Create New Request for Quote</h1>
        <p style={{ color: '#666' }}>Fill in the details below to get competitive quotes from suppliers</p>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'flex', marginBottom: '32px', position: 'relative' }}>
        {steps.map((step, idx) => (
          <div key={step.number} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', margin: '0 auto 8px',
              background: currentStep >= step.number ? '#2d3561' : '#e2e8f0',
              color: currentStep >= step.number ? 'white' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600'
            }}>
              {currentStep > step.number ? <CheckCircle size={18} /> : step.number}
            </div>
            <div style={{ fontSize: '12px', color: currentStep >= step.number ? '#2d3561' : '#94a3b8' }}>{step.title}</div>
            {idx < steps.length - 1 && (
              <div style={{ position: 'absolute', top: '18px', left: '50%', width: '100%', height: '2px', background: '#e2e8f0', zIndex: -1 }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #eef2f6' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>RFQ Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., CNC Machined Aluminum Brackets" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Description</label>
            <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Provide detailed description..." style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div><label style={{ fontWeight: '500' }}>Required By *</label><input type="date" value={formData.requiredBy} onChange={(e) => setFormData({ ...formData, requiredBy: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
            <div><label style={{ fontWeight: '500' }}>Delivery Location</label><input type="text" placeholder="City, State" value={formData.deliveryLocation} onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
            <div><label style={{ fontWeight: '500' }}>Payment Terms</label><select value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #e2e8f0', borderRadius: '8px' }}><option>Net 30</option><option>Net 45</option><option>Net 60</option></select></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px' }}>
            <button onClick={() => navigate('/buyer/rfq')} style={{ padding: '10px 24px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => setCurrentStep(2)} disabled={!formData.title} style={{ padding: '10px 24px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      )}

      {/* Step 2: Part Details */}
      {currentStep === 2 && (
        <div>
          {items.map((item, idx) => (
            <div key={item.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid #eef2f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontWeight: '600' }}>Part {idx + 1}</h3>
                {items.length > 1 && <button onClick={() => handleRemoveItem(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /> Remove</button>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                <div><label style={{ fontWeight: '500' }}>Part Name *</label><input type="text" placeholder="e.g., Aluminum Bracket" value={item.partName} onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, partName: e.target.value } : i))} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                <div><label style={{ fontWeight: '500' }}>Part Number</label><input type="text" placeholder="Optional" value={item.partNumber} onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, partNumber: e.target.value } : i))} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                <div><label style={{ fontWeight: '500' }}>Quantity *</label><input type="number" value={item.quantity} onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, quantity: parseInt(e.target.value) } : i))} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                <div><label style={{ fontWeight: '500' }}>Unit</label><select value={item.unit} onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, unit: e.target.value } : i))} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #e2e8f0', borderRadius: '8px' }}><option>pcs</option><option>kg</option><option>meters</option><option>sets</option></select></div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '500' }}>Specifications</label>
                <textarea rows={3} placeholder="Material, dimensions, tolerances..." value={item.description} onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ fontWeight: '500' }}>Drawings / Technical Documents</label>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', marginTop: '8px', cursor: 'pointer' }}>
                  <Upload size={24} color="#94a3b8" />
                  <p style={{ fontSize: '13px', marginTop: '8px' }}>Click to upload drawings</p>
                  <input type="file" multiple accept=".pdf,.dwg,.step,.jpg" onChange={(e) => handleFileUpload(item.id, e.target.files)} style={{ display: 'none' }} id={`file-upload-${item.id}`} />
                  <button onClick={() => document.getElementById(`file-upload-${item.id}`)?.click()} style={{ marginTop: '8px', padding: '6px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Select Files</button>
                </div>
                {item.drawings.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    {item.drawings.map((file, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f8fafc', borderRadius: '6px', marginBottom: '6px' }}>
                        <FileText size={14} /> <span style={{ flex: 1, fontSize: '13px' }}>{file.name}</span>
                        <button onClick={() => removeFile(item.id, idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <button onClick={handleAddItem} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', color: '#2d3561', cursor: 'pointer', marginBottom: '24px' }}><Plus size={18} /> Add Another Part</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <button onClick={() => setCurrentStep(1)} style={{ padding: '10px 24px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back</button>
            <button onClick={() => setCurrentStep(3)} style={{ padding: '10px 24px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      )}

      {/* Step 3: Requirements */}
      {currentStep === 3 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #eef2f6' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '500' }}>Quality Requirements</label>
            <textarea rows={3} placeholder="ISO standards, inspection requirements..." value={formData.qualityRequirements} onChange={(e) => setFormData({ ...formData, qualityRequirements: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '500' }}>PPAP Level</label>
            <select value={formData.ppapLevel} onChange={(e) => setFormData({ ...formData, ppapLevel: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <option>Level 1 - Part Submission Warrant (PSW)</option>
              <option>Level 2 - PSW with product samples</option>
              <option>Level 3 - Full PPAP package</option>
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '500' }}>Special Instructions</label>
            <textarea rows={2} placeholder="Any additional requirements..." value={formData.specialInstructions} onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '32px' }}>
            <button onClick={() => setCurrentStep(2)} style={{ padding: '10px 24px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back</button>
            <button onClick={() => setCurrentStep(4)} style={{ padding: '10px 24px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      )}

      {/* Step 4: Submit */}
      {currentStep === 4 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #eef2f6' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Review & Submit</h3>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <p><strong>Title:</strong> {formData.title || 'Not specified'}</p>
            <p><strong>Parts:</strong> {items.length} item(s)</p>
            <p><strong>Required By:</strong> {formData.requiredBy || 'Not specified'}</p>
            <p><strong>Documents:</strong> {items.reduce((sum, i) => sum + i.drawings.length, 0)} file(s) attached</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <button onClick={() => setCurrentStep(3)} style={{ padding: '10px 24px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back</button>
            <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '10px 24px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={16} /> {isSubmitting ? 'Submitting...' : 'Publish RFQ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRFQ;
