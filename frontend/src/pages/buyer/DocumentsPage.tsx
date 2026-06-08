import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image, File, Download, Trash2, Upload, Search, Filter, Grid, List, Clock, User, Plus, X } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  entityId: string;
  entityType: string;
  url?: string;
}

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('drawing');
  const [entityId, setEntityId] = useState('');
  const [entityType, setEntityType] = useState('rfq');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'RFQ-001_Drawing.pdf', type: 'drawing', size: '2.4 MB', uploadedAt: '2024-01-15', uploadedBy: 'John Doe', entityId: 'rfq_001', entityType: 'rfq' },
    { id: '2', name: 'PO-001_Signed.pdf', type: 'po', size: '890 KB', uploadedAt: '2024-01-14', uploadedBy: 'Jane Smith', entityId: 'po_001', entityType: 'po' },
    { id: '3', name: 'Certificate_ISO9001.pdf', type: 'certificate', size: '1.2 MB', uploadedAt: '2024-01-10', uploadedBy: 'Admin', entityId: 'cert_001', entityType: 'certificate' },
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newDoc: Document = {
      id: Date.now().toString(),
      name: selectedFile.name,
      type: docType,
      size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'Current User',
      entityId: entityId || `doc_${Date.now()}`,
      entityType: entityType,
    };
    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploading(false);
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'drawing': return <Image size={20} />;
      case 'po': return <FileText size={20} />;
      default: return <File size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'drawing': return '#3b82f6';
      case 'po': return '#10b981';
      case 'certificate': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const stats = {
    total: documents.length,
    drawings: documents.filter(d => d.type === 'drawing').length,
    pos: documents.filter(d => d.type === 'po').length,
    recent: documents.filter(d => new Date(d.uploadedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>Documents</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>Manage all your RFQ drawings, PO documents, and certificates</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <Upload size={16} /> Upload Document
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>{stats.total}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Total Documents</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>{stats.drawings}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Drawings</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>{stats.pos}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>PO Documents</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>{stats.recent}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Recent Uploads</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', flex: 1 }}>
            <Search size={16} color="#94a3b8" />
            <input type="text" placeholder="Search documents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', flex: 1 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: '6px 12px', borderRadius: '6px', background: viewMode === 'grid' ? 'white' : 'transparent', border: 'none', cursor: 'pointer' }}><Grid size={16} /></button>
          <button onClick={() => setViewMode('list')} style={{ padding: '6px 12px', borderRadius: '6px', background: viewMode === 'list' ? 'white' : 'transparent', border: 'none', cursor: 'pointer' }}><List size={16} /></button>
        </div>
      </div>

      {/* Documents Grid */}
      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {documents.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map(doc => (
            <div key={doc.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #eef2f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${getTypeColor(doc.type)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getTypeColor(doc.type) }}>
                  {getTypeIcon(doc.type)}
                </div>
                <div><p style={{ fontWeight: '600', marginBottom: '4px' }}>{doc.name}</p><p style={{ fontSize: '11px', color: '#94a3b8' }}>{doc.size}</p></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '12px', color: '#666' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {doc.uploadedBy}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {doc.uploadedAt}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #eef2f6', paddingTop: '12px' }}>
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '6px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Download size={14} /> Download</button>
                <button style={{ padding: '6px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f6', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#fafbfc' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Name</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Type</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Size</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Uploaded By</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Date</th>
              <th></th>
            </tr></thead>
            <tbody>
              {documents.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map(doc => (
                <tr key={doc.id} style={{ borderBottom: '1px solid #eef2f6' }}>
                  <td style={{ padding: '14px 20px' }}>{doc.name}</td>
                  <td style={{ padding: '14px 20px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: `${getTypeColor(doc.type)}15`, color: getTypeColor(doc.type) }}>{doc.type}</span></td>
                  <td style={{ padding: '14px 20px', color: '#666' }}>{doc.size}</td>
                  <td style={{ padding: '14px 20px', color: '#666' }}>{doc.uploadedBy}</td>
                  <td style={{ padding: '14px 20px', color: '#666' }}>{doc.uploadedAt}</td>
                  <td style={{ padding: '14px 20px' }}><Download size={16} color="#3b82f6" style={{ cursor: 'pointer' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} onClick={() => setShowUploadModal(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '16px', padding: '28px', width: '450px', maxWidth: '90%', zIndex: 999 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Upload Document</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <option value="drawing">Drawing</option>
                <option value="po">Purchase Order</option>
                <option value="certificate">Certificate</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Associated With</label>
              <select value={entityType} onChange={(e) => setEntityType(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <option value="rfq">RFQ</option>
                <option value="po">Purchase Order</option>
                <option value="general">General</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Reference ID (Optional)</label>
              <input type="text" placeholder="e.g., RFQ-001 or PO-001" value={entityId} onChange={(e) => setEntityId(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Select File</label>
              <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowUploadModal(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleUpload} disabled={!selectedFile || uploading} style={{ flex: 1, padding: '12px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentsPage;
