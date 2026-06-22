import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Clock, CheckCircle, AlertCircle, Search, ChevronRight } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatDate } from '../../utils/formatters';

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await realApi.getProjects();
      setProjects(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'quoting': return { bg: '#fff3e0', color: '#e65100', text: 'RFQ Stage', icon: <Clock size={14} /> };
      case 'quotes_received': return { bg: '#e8f5e9', color: '#2e7d32', text: 'Quotes Received', icon: <CheckCircle size={14} /> };
      case 'po_issued': return { bg: '#e3f2fd', color: '#1565c0', text: 'PO Stage', icon: <CheckCircle size={14} /> };
      case 'production': return { bg: '#f3e5f5', color: '#7b1fa2', text: 'Production', icon: <Clock size={14} /> };
      default: return { bg: '#f1f5f9', color: '#475569', text: status || 'Draft', icon: <AlertCircle size={14} /> };
    }
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.project_number.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="animate-fadeIn" style={{ padding: '40px', textAlign: 'center' }}>Loading projects...</div>;

  return (
    <div className="animate-fadeInUp" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', background: 'linear-gradient(135deg, #1e293b 0%, #2d3561 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Projects</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>All your manufacturing projects in one place</p>
        </div>
        <button onClick={() => navigate('/buyer/projects/create')} className="hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '40px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <Plus size={18} /> New Project
        </button>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '40px', padding: '8px 16px', maxWidth: '400px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px solid #eef2f6' }}>
          <FolderOpen size={48} color="#94a3b8" />
          <h3 style={{ marginTop: '16px', fontWeight: '600' }}>No projects yet</h3>
          <p style={{ color: '#64748b' }}>Create your first manufacturing project</p>
          <button onClick={() => navigate('/buyer/projects/create')} style={{ marginTop: '20px', padding: '10px 24px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer' }} className="hover-lift">Create Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
          {filtered.map((project, idx) => {
            const status = getStatusBadge(project.status);
            return (
              <div key={project.id} onClick={() => navigate(`/buyer/projects/${project.id}`)} className="hover-lift animate-scaleIn" style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }}>{project.project_number}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: status.bg, color: status.color }}>{status.icon} {status.text}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{project.name}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: '1.4' }}>{project.description?.slice(0, 100)}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b', borderTop: '1px solid #eef2f6', paddingTop: '16px' }}>
                  <span>📄 RFQs: {project.rfq_count || 0}</span>
                  <span>💬 Quotes: {project.quote_count || 0}</span>
                  <span>📦 POs: {project.po_count || 0}</span>
                </div>
                <div style={{ marginTop: '12px', textAlign: 'right' }}>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ProjectsList;
