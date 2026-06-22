import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Package, FileText, Clock, User, Mail, Phone,
  MapPin, Building, Calendar, DollarSign, CheckCircle, AlertCircle,
  MessageSquare, Download, Upload, Trash2, Eye, Send, Check,
  TrendingUp, Layers, Briefcase, Shield
} from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatDate, formatCurrency } from '../../utils/formatters';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      navigate('/buyer/projects');
      return;
    }
    loadProject();
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await realApi.getProjectById(id!);
      setProject(data);
    } catch (err: any) {
      console.error('Error loading project:', err);
      if (err.response?.status === 404 || err.response?.data?.error?.includes('UUID')) {
        setError('Project not found');
      } else {
        setError(err.response?.data?.error || 'Failed to load project');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await realApi.sendProjectMessage(id!, newMessage);
      setNewMessage('');
      await loadProject();
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    if (!window.confirm('Accept this quote? A Purchase Order will be created.')) return;
    setAccepting(quoteId);
    try {
      await realApi.acceptQuote(quoteId);
      alert('Quote accepted! Purchase Order created.');
      await loadProject();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to accept quote');
    } finally {
      setAccepting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '60vh' }}>
        <div className="loader-spinner"></div>
        <style>{`
          .flex-center { display: flex; justify-content: center; align-items: center; }
          .loader-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #e2e8f0;
            border-top-color: #2d3561;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-center" style={{ height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <AlertCircle size={56} color="#ef4444" />
        <h2 style={{ color: '#1e293b', margin: 0 }}>Project Not Found</h2>
        <p style={{ color: '#64748b' }}>{error || 'The project you are looking for does not exist.'}</p>
        <button
          onClick={() => navigate('/buyer/projects')}
          style={{ padding: '10px 28px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer' }}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const hasRFQ = project.rfqs && project.rfqs.length > 0;
  const rfq = hasRFQ ? project.rfqs[0] : null;
  const hasQuotes = project.quotes && project.quotes.length > 0;
  const hasOrders = project.purchase_orders && project.purchase_orders.length > 0;
  const hasDocs = project.documents && project.documents.length > 0;
  const hasMessages = project.messages && project.messages.length > 0;
  const hasTimeline = project.timeline && project.timeline.length > 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Layers size={18} /> },
    { id: 'rfq', label: 'RFQ', icon: <FileText size={18} />, count: hasRFQ ? 1 : 0 },
    { id: 'quotes', label: 'Quotes', icon: <DollarSign size={18} />, count: project.quotes?.length || 0 },
    { id: 'orders', label: 'Orders', icon: <Package size={18} />, count: project.purchase_orders?.length || 0 },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} />, count: project.messages?.length || 0 },
    { id: 'documents', label: 'Documents', icon: <Download size={18} />, count: project.documents?.length || 0 },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={18} />, count: project.timeline?.length || 0 },
  ];

  const statusColor = {
    active: 'bg-blue-50 text-blue-700 border-blue-200',
    quoting: 'bg-amber-50 text-amber-700 border-amber-200',
    quotes_received: 'bg-purple-50 text-purple-700 border-purple-200',
    po_issued: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div className="project-details-page">
      {/* Back Button */}
      <button onClick={() => navigate('/buyer/projects')} className="back-btn">
        <ArrowLeft size={18} /> Back to Projects
      </button>

      {/* Hero Header */}
      <div className="hero-header">
        <div className="hero-content">
          <div>
            <h1 className="hero-title">{project.name}</h1>
            <p className="hero-subtitle">{project.project_number}</p>
          </div>
          <div className="hero-actions">
            {!hasRFQ && (
              <button onClick={() => navigate(`/buyer/projects/${id}/rfq/new`)} className="btn-primary">
                <FileText size={18} /> Create RFQ
              </button>
            )}
            <span className={`status-pill ${project.status}`}>
              {project.status?.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="hero-metrics">
          <div className="metric-item">
            <div className="metric-icon" style={{ background: '#3b82f6' }}><Building size={16} color="white" /></div>
            <div><div className="metric-label">Industry</div><div className="metric-value">{project.industry || '—'}</div></div>
          </div>
          <div className="metric-item">
            <div className="metric-icon" style={{ background: '#10b981' }}><Package size={16} color="white" /></div>
            <div><div className="metric-label">Target Quantity</div><div className="metric-value">{project.target_quantity || '—'}</div></div>
          </div>
          <div className="metric-item">
            <div className="metric-icon" style={{ background: '#f59e0b' }}><Calendar size={16} color="white" /></div>
            <div><div className="metric-label">Target Delivery</div><div className="metric-value">{formatDate(project.target_delivery_date)}</div></div>
          </div>
          <div className="metric-item">
            <div className="metric-icon" style={{ background: '#8b5cf6' }}><Clock size={16} color="white" /></div>
            <div><div className="metric-label">Created</div><div className="metric-value">{formatDate(project.created_at)}</div></div>
          </div>
        </div>
        {project.description && <p className="hero-description">{project.description}</p>}
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
            {tab.count > 0 && <span className="tab-badge">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content animate-fadeIn">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}><TrendingUp size={24} color="white" /></div>
              <div><div className="stat-label">Status</div><div className="stat-value">{project.status}</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><FileText size={24} color="white" /></div>
              <div><div className="stat-label">RFQ</div><div className="stat-value">{hasRFQ ? 'Created' : 'Not Created'}</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><DollarSign size={24} color="white" /></div>
              <div><div className="stat-label">Quotes</div><div className="stat-value">{project.quotes?.length || 0}</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><Package size={24} color="white" /></div>
              <div><div className="stat-label">Orders</div><div className="stat-value">{project.purchase_orders?.length || 0}</div></div>
            </div>
          </div>
        )}

        {/* RFQ */}
        {activeTab === 'rfq' && (
          <div className="section-card">
            <h3 className="section-title"><FileText size={20} /> RFQ Details</h3>
            {!hasRFQ ? (
              <div className="empty-state">
                <FileText size={56} color="#cbd5e1" />
                <p>No RFQ created yet</p>
                <button onClick={() => navigate(`/buyer/projects/${id}/rfq/new`)} className="btn-primary">
                  Create RFQ
                </button>
              </div>
            ) : (
              <div className="rfq-grid">
                <div><span className="label">Title</span><span className="value">{rfq.title}</span></div>
                <div><span className="label">Part Name</span><span className="value">{rfq.part_name}</span></div>
                <div><span className="label">Part Number</span><span className="value">{rfq.part_number || '—'}</span></div>
                <div><span className="label">Quantity</span><span className="value">{rfq.quantity} {rfq.unit}</span></div>
                <div><span className="label">Required Delivery</span><span className="value">{formatDate(rfq.required_delivery_date)}</span></div>
                <div><span className="label">PPAP Level</span><span className="value">{rfq.ppap_level || '—'}</span></div>
                <div><span className="label">Payment Terms</span><span className="value">{rfq.payment_terms || '—'}</span></div>
                <div><span className="label">Status</span><span className="value">{rfq.status}</span></div>
                {rfq.description && <div className="full-width"><span className="label">Description</span><span className="value">{rfq.description}</span></div>}
                {rfq.quality_requirements && <div className="full-width"><span className="label">Quality Requirements</span><span className="value">{rfq.quality_requirements}</span></div>}
                {rfq.special_instructions && <div className="full-width"><span className="label">Special Instructions</span><span className="value">{rfq.special_instructions}</span></div>}
                {rfq.special_requirements && <div className="full-width"><span className="label">Special Requirements</span><span className="value">{rfq.special_requirements}</span></div>}
              </div>
            )}
          </div>
        )}

        {/* Quotes */}
        {activeTab === 'quotes' && (
          <div className="section-card">
            <h3 className="section-title"><DollarSign size={20} /> Quotes ({project.quotes?.length || 0})</h3>
            {!hasQuotes ? (
              <div className="empty-state">
                <DollarSign size={56} color="#cbd5e1" />
                <p>No quotes received yet</p>
              </div>
            ) : (
              project.quotes.map((quote: any) => (
                <div key={quote.id} className="quote-card">
                  <div className="quote-header">
                    <div><strong>{quote.supplier_name}</strong> <span className="quote-number">{quote.quote_number}</span></div>
                    <span className={`status-badge ${quote.status}`}>{quote.status}</span>
                  </div>
                  <div className="quote-details">
                    <span><strong>Unit Price:</strong> {formatCurrency(quote.unit_price, quote.currency)}</span>
                    <span><strong>Total:</strong> {formatCurrency(quote.total_price, quote.currency)}</span>
                    <span><strong>Lead Time:</strong> {quote.lead_time_days} days</span>
                    <span><strong>Delivery:</strong> {quote.delivery_terms}</span>
                  </div>
                  {quote.notes && <div className="quote-notes"><strong>Notes:</strong> {quote.notes}</div>}
                  {quote.status === 'pending' && (
                    <button onClick={() => handleAcceptQuote(quote.id)} disabled={accepting === quote.id} className="accept-btn">
                      <Check size={16} /> {accepting === quote.id ? 'Accepting...' : 'Accept Quote'}
                    </button>
                  )}
                  {quote.status === 'accepted' && <div className="accepted-badge">✅ Accepted</div>}
                </div>
              ))
            )}
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="section-card">
            <h3 className="section-title"><Package size={20} /> Purchase Orders ({project.purchase_orders?.length || 0})</h3>
            {!hasOrders ? (
              <div className="empty-state">
                <Package size={56} color="#cbd5e1" />
                <p>No orders placed yet</p>
              </div>
            ) : (
              project.purchase_orders.map((order: any) => (
                <div key={order.id} className="order-card" onClick={() => navigate(`/buyer/orders/${order.id}`)}>
                  <div className="order-header">
                    <span className="order-number">{order.po_number}</span>
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                  </div>
                  <div className="order-meta">
                    <span>{formatDate(order.created_at)}</span>
                    <span><strong>Total:</strong> {formatCurrency(order.total_amount, order.currency)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Messages */}
        {activeTab === 'messages' && (
          <div className="section-card">
            <h3 className="section-title"><MessageSquare size={20} /> Messages ({project.messages?.length || 0})</h3>
            <div className="messages-list">
              {!hasMessages ? (
                <div className="empty-state">
                  <MessageSquare size={56} color="#cbd5e1" />
                  <p>No messages yet</p>
                </div>
              ) : (
                project.messages.map((msg: any) => (
                  <div key={msg.id} className="message-item">
                    <div className="message-sender">{msg.sender_name} <span className="message-time">{formatDate(msg.created_at)}</span></div>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))
              )}
            </div>
            <div className="message-input-wrap">
              <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." rows={2} />
              <button onClick={handleSendMessage} disabled={sending || !newMessage.trim()} className="send-btn">
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Documents */}
        {activeTab === 'documents' && (
          <div className="section-card">
            <h3 className="section-title"><Download size={20} /> Documents ({project.documents?.length || 0})</h3>
            {!hasDocs ? (
              <div className="empty-state">
                <Download size={56} color="#cbd5e1" />
                <p>No documents attached</p>
              </div>
            ) : (
              project.documents.map((doc: any) => (
                <div key={doc.id} className="doc-item">
                  <div><FileText size={16} /> {doc.original_name} <span className="doc-size">({Math.round(doc.file_size / 1024)} KB)</span></div>
                  <div className="doc-actions">
                    <button onClick={() => window.open(`/uploads/${doc.filename}`, '_blank')}><Eye size={16} /></button>
                    <button onClick={() => { const link = document.createElement('a'); link.href = `/uploads/${doc.filename}`; link.download = doc.original_name; link.click(); }}><Download size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Timeline */}
        {activeTab === 'timeline' && (
          <div className="section-card">
            <h3 className="section-title"><Clock size={20} /> Timeline ({project.timeline?.length || 0})</h3>
            {!hasTimeline ? (
              <div className="empty-state">
                <Clock size={56} color="#cbd5e1" />
                <p>No timeline events yet</p>
              </div>
            ) : (
              <div className="timeline">
                {project.timeline.map((event: any, idx: number) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <strong>{event.event_type}</strong>
                        <span className="timeline-time">{formatDate(event.created_at)}</span>
                      </div>
                      <p className="timeline-desc">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .project-details-page {
          max-width: 1440px;
          margin: 0 auto;
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 18px;
          border-radius: 40px;
          cursor: pointer;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          margin-bottom: 24px;
        }
        .back-btn:hover {
          transform: translateX(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .hero-header {
          background: white;
          border-radius: 28px;
          padding: 28px 32px;
          border: 1px solid #eef2f6;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          margin-bottom: 32px;
        }
        .hero-content {
          display: flex;
          justify-content: space-between;
          align-items: start;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
        }
        .hero-title {
          font-size: 30px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .hero-subtitle {
          color: #64748b;
          font-size: 14px;
          margin: 4px 0 0;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #2d3561, #1e293b);
          color: white;
          border: none;
          border-radius: 40px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(45,53,97,0.2);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(45,53,97,0.3);
        }
        .status-pill {
          padding: 6px 18px;
          border-radius: 40px;
          font-weight: 500;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .status-pill.active { background: #dbeafe; color: #1e40af; }
        .status-pill.quoting { background: #fef3c7; color: #92400e; }
        .status-pill.quotes_received { background: #ede9fe; color: #5b21b6; }
        .status-pill.po_issued { background: #d1fae5; color: #065f46; }
        .status-pill.completed { background: #f1f5f9; color: #475569; }

        .hero-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px,1fr));
          gap: 16px;
          padding: 16px 0;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 16px;
        }
        .metric-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .metric-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .metric-label { font-size: 12px; color: #94a3b8; }
        .metric-value { font-size: 15px; font-weight: 600; color: #1e293b; }
        .hero-description { color: #475569; font-size: 14px; margin: 0; }

        /* Tabs */
        .tabs-container {
          display: flex;
          gap: 4px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 40px;
          margin-bottom: 28px;
          overflow-x: auto;
          flex-wrap: nowrap;
        }
        .tab-btn {
          flex: 0 0 auto;
          padding: 10px 20px;
          border: none;
          background: transparent;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .tab-btn.active {
          background: white;
          color: #1e293b;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .tab-btn:hover { color: #1e293b; }
        .tab-badge {
          background: #e2e8f0;
          color: #475569;
          padding: 0 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        .tab-btn.active .tab-badge { background: #2d3561; color: white; }

        /* Tab Content */
        .tab-content { background: white; border-radius: 24px; padding: 28px; border: 1px solid #eef2f6; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }

        /* Overview Stats */
        .overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 20px; }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #eef2f6;
          transition: all 0.2s;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 16px -8px rgba(0,0,0,0.06); }
        .stat-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-label { font-size: 13px; color: #64748b; }
        .stat-value { font-size: 22px; font-weight: 700; color: #1e293b; }

        /* Section Card */
        .section-card { }
        .section-title { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 20px; }
        .empty-state { text-align: center; padding: 48px 0; color: #94a3b8; }
        .empty-state p { margin: 12px 0 16px; font-size: 15px; }

        /* RFQ Grid */
        .rfq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px,1fr));
          gap: 16px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 16px;
        }
        .rfq-grid .full-width { grid-column: 1 / -1; }
        .rfq-grid .label { font-size: 12px; color: #94a3b8; display: block; }
        .rfq-grid .value { font-size: 15px; font-weight: 500; color: #1e293b; }

        /* Quote Cards */
        .quote-card {
          background: #f8fafc;
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 12px;
          border-left: 4px solid #e2e8f0;
          transition: all 0.2s;
        }
        .quote-card:hover { border-left-color: #2d3561; background: #f1f5f9; }
        .quote-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .quote-number { font-size: 13px; color: #94a3b8; margin-left: 8px; }
        .quote-details { display: flex; flex-wrap: wrap; gap: 16px; font-size: 14px; margin-top: 8px; }
        .quote-notes { font-size: 13px; color: #475569; margin-top: 8px; padding: 8px 12px; background: white; border-radius: 8px; }
        .accept-btn {
          margin-top: 12px;
          padding: 6px 18px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 40px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .accept-btn:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
        .accepted-badge { margin-top: 12px; color: #10b981; font-weight: 500; font-size: 14px; }

        /* Order Cards */
        .order-card {
          background: #f8fafc;
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .order-card:hover { background: #f1f5f9; transform: translateX(4px); }
        .order-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .order-number { font-weight: 600; font-size: 16px; color: #1e293b; }
        .order-meta { display: flex; gap: 24px; font-size: 14px; color: #475569; margin-top: 6px; }

        .status-badge {
          padding: 2px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .status-badge.pending { background: #fef3c7; color: #92400e; }
        .status-badge.accepted { background: #d1fae5; color: #065f46; }
        .status-badge.issued { background: #dbeafe; color: #1e40af; }
        .status-badge.production { background: #ede9fe; color: #5b21b6; }
        .status-badge.shipped { background: #fef3c7; color: #92400e; }
        .status-badge.delivered { background: #d1fae5; color: #065f46; }
        .status-badge.rejected { background: #fee2e2; color: #991b1b; }

        /* Messages */
        .messages-list { max-height: 400px; overflow-y: auto; margin-bottom: 16px; }
        .message-item {
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 8px;
        }
        .message-sender { font-weight: 600; font-size: 14px; display: flex; justify-content: space-between; }
        .message-time { font-weight: 400; color: #94a3b8; font-size: 12px; }
        .message-content { margin-top: 4px; color: #1e293b; font-size: 14px; }
        .message-input-wrap {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        .message-input-wrap textarea {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          resize: none;
          font-family: inherit;
          font-size: 14px;
          min-height: 52px;
          transition: all 0.2s;
        }
        .message-input-wrap textarea:focus { outline: none; border-color: #2d3561; box-shadow: 0 0 0 3px rgba(45,53,97,0.1); }
        .send-btn {
          padding: 0 20px;
          height: 52px;
          background: #2d3561;
          color: white;
          border: none;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .send-btn:hover { background: #1e293b; }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Documents */
        .doc-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 6px;
        }
        .doc-item .doc-size { font-size: 12px; color: #94a3b8; margin-left: 6px; }
        .doc-actions { display: flex; gap: 8px; }
        .doc-actions button { background: none; border: none; cursor: pointer; color: #64748b; transition: all 0.2s; padding: 4px; }
        .doc-actions button:hover { color: #1e293b; transform: scale(1.1); }

        /* Timeline */
        .timeline { position: relative; padding-left: 24px; }
        .timeline::before { content: ''; position: absolute; left: 6px; top: 0; bottom: 0; width: 2px; background: #e2e8f0; }
        .timeline-item { position: relative; padding-left: 20px; padding-bottom: 20px; }
        .timeline-dot {
          position: absolute; left: -18px; top: 4px;
          width: 12px; height: 12px;
          border-radius: 50%;
          background: #2d3561;
          border: 2px solid white;
          box-shadow: 0 0 0 2px #2d3561;
        }
        .timeline-content {
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 12px;
        }
        .timeline-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .timeline-time { font-size: 12px; color: #94a3b8; }
        .timeline-desc { margin: 4px 0 0; font-size: 14px; color: #475569; }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-content { flex-direction: column; align-items: stretch; }
          .hero-metrics { grid-template-columns: 1fr 1fr; }
          .overview-grid { grid-template-columns: 1fr 1fr; }
          .rfq-grid { grid-template-columns: 1fr; }
          .tabs-container { border-radius: 20px; }
          .tab-btn { padding: 8px 14px; font-size: 13px; }
          .project-details-page { padding: 16px; }
        }
        @media (max-width: 480px) {
          .hero-metrics { grid-template-columns: 1fr; }
          .overview-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ProjectDetails;
