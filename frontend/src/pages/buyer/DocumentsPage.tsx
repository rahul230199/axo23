import React, { useState } from 'react';
import { Upload, FileText, Trash2, Search, X } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { useDocuments } from '../../hooks/useRealData';

const DocumentsPage: React.FC = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('project');
  const [entityId, setEntityId] = useState('');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const { data: documents, refetch, loading } = useDocuments();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !entityId) return;
    setUploading(true);
    try {
      await realApi.uploadDocument(selectedFile, entityId, docType);
      await refetch();
      setShowUpload(false);
      setSelectedFile(null);
      setEntityId('');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (window.confirm('Delete this document?')) {
      try {
        await realApi.deleteDocument(docId);
        await refetch();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const filtered = (documents || []).filter((d: any) => 
    d.original_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.entity_type?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading documents...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Documents</h1>
        <button 
          onClick={() => setShowUpload(true)} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer' }}
          className="hover-lift"
        >
          <Upload size={18} /> Upload Document
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '40px', padding: '8px 16px', maxWidth: '300px' }}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ flex: 1, border: 'none', outline: 'none' }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px' }}>
          <FileText size={48} color="#94a3b8" />
          <p style={{ marginTop: '16px', color: '#64748b' }}>No documents found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map((doc: any) => (
            <div key={doc.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #eef2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="hover-lift">
              <div>
                <div style={{ fontWeight: '600' }}>{doc.original_name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Type: {doc.entity_type} • {Math.round(doc.file_size / 1024)} KB</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(doc.created_at).toLocaleDateString()}</div>
              </div>
              <button onClick={() => handleDelete(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                <Trash2 size={18} color="#ef4444" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Upload Document</h3>
              <button onClick={() => setShowUpload(false)}><X size={24} /></button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Entity Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <option value="project">Project</option>
                <option value="rfq">RFQ</option>
                <option value="po">Purchase Order</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Entity ID</label>
              <input type="text" value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="e.g., project UUID" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>File</label>
              <input type="file" onChange={handleFileChange} style={{ width: '100%' }} />
            </div>
            <button onClick={handleUpload} disabled={uploading || !selectedFile || !entityId} style={{ width: '100%', padding: '12px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '40px', fontWeight: '600', cursor: 'pointer' }}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
