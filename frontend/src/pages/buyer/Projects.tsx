import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, FolderOpen, CheckCircle, Clock, AlertCircle, 
  ChevronRight, Calendar, Package, Building, TrendingUp, 
  LayoutGrid, List
} from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatDate } from '../../utils/formatters';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    quoting: 0,
    po_issued: 0,
    completed: 0
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await realApi.getProjects();
      setProjects(data || []);
      // Calculate stats
      const total = data.length;
      const active = data.filter((p: any) => p.status === 'active').length;
      const quoting = data.filter((p: any) => p.status === 'quoting' || p.status === 'quotes_received').length;
      const po_issued = data.filter((p: any) => p.status === 'po_issued').length;
      const completed = data.filter((p: any) => p.status === 'completed').length;
      setStats({ total, active, quoting, po_issued, completed });
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.project_number?.toLowerCase().includes(search.toLowerCase()) ||
    p.industry?.toLowerCase().includes(search.toLowerCase())
  );

  // Group projects by status for board view
  const statusColumns = [
    { key: 'active', label: 'Active', icon: <CheckCircle size={14} />, color: '#3b82f6' },
    { key: 'quoting', label: 'Quoting', icon: <Clock size={14} />, color: '#f59e0b' },
    { key: 'quotes_received', label: 'Quotes Received', icon: <AlertCircle size={14} />, color: '#8b5cf6' },
    { key: 'po_issued', label: 'PO Issued', icon: <Package size={14} />, color: '#10b981' },
    { key: 'completed', label: 'Completed', icon: <CheckCircle size={14} />, color: '#6b7280' },
  ];

  const getProjectsByStatus = (statusKey: string) => {
    if (statusKey === 'quoting') {
      return filteredProjects.filter(p => p.status === 'quoting' || p.status === 'quotes_received');
    }
    return filteredProjects.filter(p => p.status === statusKey);
  };

  const getStatusBadge = (status: string) => {
    const map: any = {
      active: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', label: 'Active' },
      quoting: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', label: 'Quoting' },
      quotes_received: { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', label: 'Quotes Received' },
      po_issued: { bg: 'linear-gradient(135deg, #10b981, #059669)', label: 'PO Issued' },
      completed: { bg: 'linear-gradient(135deg, #6b7280, #4b5563)', label: 'Completed' },
    };
    return map[status] || { bg: '#e2e8f0', label: status };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loader">Loading projects...</div>
        <style>{`
          .loader {
            animation: pulse 1.5s infinite;
            color: #94a3b8;
            font-size: 16px;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="projects-container">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your manufacturing projects</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
            >
              <LayoutGrid size={16} /> Board
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} /> List
            </button>
          </div>
          <button onClick={() => navigate('/buyer/projects/new')} className="create-btn">
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <FolderOpen size={20} color="white" />
          </div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <CheckCircle size={20} color="white" />
          </div>
          <div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Clock size={20} color="white" />
          </div>
          <div>
            <div className="stat-value">{stats.quoting}</div>
            <div className="stat-label">In Quoting</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Package size={20} color="white" />
          </div>
          <div>
            <div className="stat-value">{stats.po_issued}</div>
            <div className="stat-label">PO Issued</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)' }}>
            <TrendingUp size={20} color="white" />
          </div>
          <div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="search-bar">
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search by name, project number, or industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Board View ── */}
      {viewMode === 'board' && (
        <div className="board-container">
          {statusColumns.map((column) => {
            const columnProjects = getProjectsByStatus(column.key);
            return (
              <div key={column.key} className="board-column">
                <div className="column-header">
                  <span className="column-title">
                    {column.icon} {column.label}
                  </span>
                  <span className="column-count">{columnProjects.length}</span>
                </div>
                <div className="column-content">
                  {columnProjects.length === 0 ? (
                    <div className="empty-column">No projects</div>
                  ) : (
                    columnProjects.map((project) => {
                      const status = getStatusBadge(project.status);
                      return (
                        <div 
                          key={project.id} 
                          className="project-card" 
                          onClick={() => navigate(`/buyer/projects/${project.id}`)}
                        >
                          <div className="card-header">
                            <div>
                              <h4 className="project-name">{project.name}</h4>
                              <span className="project-number">{project.project_number}</span>
                            </div>
                          </div>
                          <p className="project-description">{project.description || 'No description'}</p>
                          <div className="project-meta">
                            <div><Calendar size={12} /> {formatDate(project.created_at)}</div>
                            <div><Building size={12} /> {project.industry || 'General'}</div>
                          </div>
                          <div className="card-footer">
                            <span className="view-link">View <ChevronRight size={12} /></span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <div className="list-container">
          {filteredProjects.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={64} color="#cbd5e1" />
              <h3>No projects found</h3>
              <p>Create your first project to get started</p>
            </div>
          ) : (
            <div className="list-table">
              <div className="list-header">
                <span>Project</span>
                <span>Status</span>
                <span>Industry</span>
                <span>Created</span>
                <span></span>
              </div>
              {filteredProjects.map((project) => {
                const status = getStatusBadge(project.status);
                return (
                  <div key={project.id} className="list-row" onClick={() => navigate(`/buyer/projects/${project.id}`)}>
                    <div>
                      <div className="list-project-name">{project.name}</div>
                      <div className="list-project-number">{project.project_number}</div>
                    </div>
                    <span className="status-badge" style={{ background: status.bg, color: 'white' }}>
                      {status.label}
                    </span>
                    <span>{project.industry || '—'}</span>
                    <span>{formatDate(project.created_at)}</span>
                    <ChevronRight size={16} color="#94a3b8" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        .projects-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .page-title {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #1e293b, #2d3561);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .page-subtitle {
          color: #64748b;
          margin: 4px 0 0;
          font-size: 14px;
        }
        .view-toggle {
          display: flex;
          background: #f1f5f9;
          border-radius: 40px;
          padding: 4px;
        }
        .view-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border: none;
          background: transparent;
          border-radius: 30px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s;
        }
        .view-btn.active {
          background: white;
          color: #2d3561;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .view-btn:hover {
          color: #1e293b;
        }
        .create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #2d3561, #1e293b);
          color: white;
          border: none;
          border-radius: 40px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(45,53,97,0.2);
        }
        .create-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 20px rgba(45,53,97,0.3);
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid #eef2f6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px -8px rgba(0,0,0,0.08);
        }
        .stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }
        .stat-label {
          font-size: 12px;
          color: #64748b;
        }

        /* Search */
        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 40px;
          padding: 8px 20px;
          margin-bottom: 32px;
          transition: all 0.3s ease;
        }
        .search-bar:focus-within {
          border-color: #2d3561;
          box-shadow: 0 0 0 3px rgba(45,53,97,0.1);
        }
        .search-bar input {
          flex: 1;
          border: none;
          outline: none;
          padding: 10px 0;
          font-size: 14px;
          background: transparent;
        }

        /* Board View */
        .board-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          align-items: start;
        }
        .board-column {
          background: #f1f5f9;
          border-radius: 20px;
          padding: 16px;
          min-height: 200px;
          transition: all 0.2s;
        }
        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
        }
        .column-title {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .column-count {
          background: white;
          padding: 2px 10px;
          border-radius: 30px;
          font-size: 12px;
          color: #475569;
        }
        .column-content {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .empty-column {
          color: #94a3b8;
          font-size: 13px;
          text-align: center;
          padding: 20px 0;
        }

        /* Project Cards (Board) */
        .project-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #eef2f6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .project-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px -8px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
        }
        .project-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 8px;
          margin-bottom: 8px;
        }
        .project-card .project-name {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        .project-card .project-number {
          font-size: 11px;
          color: #94a3b8;
        }
        .project-card .project-description {
          color: #475569;
          font-size: 13px;
          line-height: 1.4;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .project-card .project-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 12px;
        }
        .project-card .project-meta div {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .project-card .card-footer {
          display: flex;
          justify-content: flex-end;
          padding-top: 10px;
          border-top: 1px solid #eef2f6;
        }
        .project-card .view-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #2d3561;
          font-weight: 500;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        .project-card .view-link:hover {
          gap: 8px;
        }

        /* Status Badge */
        .status-badge {
          padding: 2px 10px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }

        /* List View */
        .list-container {
          background: white;
          border-radius: 20px;
          border: 1px solid #eef2f6;
          overflow: hidden;
        }
        .list-table {
          width: 100%;
        }
        .list-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 40px;
          padding: 16px 24px;
          background: #f8fafc;
          font-weight: 600;
          font-size: 13px;
          color: #64748b;
          border-bottom: 1px solid #eef2f6;
        }
        .list-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 40px;
          padding: 16px 24px;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid #f1f5f9;
        }
        .list-row:hover {
          background: #f8fafc;
        }
        .list-row:last-child {
          border-bottom: none;
        }
        .list-project-name {
          font-weight: 500;
          color: #1e293b;
        }
        .list-project-number {
          font-size: 12px;
          color: #94a3b8;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 24px;
          border: 1px solid #eef2f6;
        }
        .empty-state h3 {
          font-size: 20px;
          color: #1e293b;
          margin: 16px 0 8px;
        }
        .empty-state p {
          color: #64748b;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .board-container {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
        }
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }
          .create-btn {
            justify-content: center;
          }
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          .board-container {
            grid-template-columns: 1fr 1fr;
          }
          .list-header, .list-row {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px;
          }
          .list-header span:last-child, .list-row span:last-child {
            display: none;
          }
        }
        @media (max-width: 480px) {
          .board-container {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .list-header, .list-row {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Projects;
