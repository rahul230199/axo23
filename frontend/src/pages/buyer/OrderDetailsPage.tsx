import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Truck, Package, Calendar, Building, CreditCard,
  FileText, MessageSquare, Clock, CheckCircle, Send, Upload,
  Download, Trash2, Plus, X, PenTool, Eye
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { realApi } from '../../services/realApi';
import { formatDate, formatCurrency } from '../../utils/formatters';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState<any>(null);
  const [rfq, setRfq] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<'messages' | 'documents' | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signatureRef = useRef<any>(null);
  const [signing, setSigning] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [signedDate, setSignedDate] = useState('');
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const poData = await realApi.getPOById(id!);
      setPo(poData);

      if (poData.rfq_id) {
        try {
          const rfqData = await realApi.getRFQById(poData.rfq_id);
          setRfq(rfqData);
        } catch {}
      }
      if (poData.quote_id) {
        try {
          const quoteData = await realApi.getQuoteById(poData.quote_id);
          setQuote(quoteData);
        } catch {}
      }

      const msgs = await realApi.getMessages(id!);
      setMessages(msgs || []);

      const docs = await realApi.getDocuments({ entityId: id, entityType: 'po' });
      setDocuments(docs || []);

      try {
        const timelineData = await realApi.getTimeline?.(id!);
        setTimeline(timelineData || []);
      } catch { /* no timeline */ }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await realApi.sendMessage(id!, newMessage);
      setNewMessage('');
      const updated = await realApi.getMessages(id!);
      setMessages(updated);
    } catch (err) { alert('Failed to send message'); } finally { setSending(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await realApi.uploadDocument(selectedFile, id!, 'po');
      setShowUpload(false);
      setSelectedFile(null);
      const updated = await realApi.getDocuments({ entityId: id, entityType: 'po' });
      setDocuments(updated);
    } catch (err) { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await realApi.deleteDocument(docId);
      const updated = await realApi.getDocuments({ entityId: id, entityType: 'po' });
      setDocuments(updated);
    } catch (err) { alert('Delete failed'); }
  };

  const handleSign = async () => {
    if (!signatureRef.current) return;
    const signatureData = signatureRef.current.toDataURL();
    if (!typedName.trim()) {
      alert('Please type your full name');
      return;
    }
    setSigning(true);
    try {
      await realApi.signPO(id!, signatureData, 'buyer', typedName, signedDate);
      await loadData();
      setShowSignaturePad(false);
      setTypedName('');
      setSignedDate('');
      alert('Signature saved');
    } catch (err) { alert('Failed to save signature'); } finally { setSigning(false); }
  };

  const clearSignature = () => { if (signatureRef.current) signatureRef.current.clear(); };

  const downloadPDF = async () => {
    const element = document.getElementById('po-content-buyer');
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 295;
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 295;
    }
    pdf.save(`PO_${po.po_number}.pdf`);
  };

  const getFileUrl = (filename: string) => `/uploads/${filename}`;

  // 🔥 SIMPLE VIEW – opens file directly in a new tab
  const handleView = (filename: string) => {
    const url = getFileUrl(filename);
    console.log('Opening file:', url);
    window.open(url, '_blank');
  };

  const handleDownload = (filename: string, originalName: string) => {
    const url = getFileUrl(filename);
    const link = document.createElement('a');
    link.href = url;
    link.download = originalName || filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="page-loader">Loading order details...</div>;
  if (!po) return <div>Order not found</div>;

  const buyerSigned = !!po.buyer_signature;
  const supplierSigned = !!po.supplier_signature;
  const bothSigned = buyerSigned && supplierSigned;

  const statusFlow = ['issued', 'accepted', 'production', 'shipped', 'delivered'];
  const currentIndex = statusFlow.indexOf(po.status);

  let itemName = rfq?.part_name || 'Item';
  if (rfq?.part_number) {
    itemName = `${itemName} (${rfq.part_number})`;
  }
  const displayItems = [{
    name: itemName,
    qty: rfq?.quantity || 1,
    price: quote?.unit_price || po.total_amount,
    total: po.total_amount
  }];

  const togglePanel = (panel: 'messages' | 'documents') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const getDefaultDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const openSignatureModal = () => {
    setTypedName(po.buyer_name || '');
    setSignedDate(getDefaultDate());
    setShowSignaturePad(true);
  };

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-header">
        <button onClick={() => navigate('/buyer/orders')} className="back-btn">
          <ChevronLeft size={18} /> Back to Orders
        </button>
        <div className="header-actions">
          {bothSigned && (
            <button onClick={downloadPDF} className="pdf-btn">
              <Download size={18} /> Download PDF
            </button>
          )}
          {!buyerSigned && (
            <button onClick={openSignatureModal} className="sign-btn-header">
              <PenTool size={18} /> Sign
            </button>
          )}
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="timeline-section">
        <div className="timeline-steps">
          {statusFlow.map((step, idx) => (
            <React.Fragment key={step}>
              <div className={`step-item ${idx <= currentIndex ? 'active' : ''}`}>
                <div className={`step-circle ${idx <= currentIndex ? 'active' : ''}`}>
                  {idx < currentIndex ? <CheckCircle size={14} /> : <Clock size={14} />}
                </div>
                <span className={`step-label ${idx === currentIndex ? 'current' : ''}`}>{step}</span>
              </div>
              {idx < statusFlow.length - 1 && <div className={`step-line ${idx < currentIndex ? 'active' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="signature-indicators">
          <div><span className={`dot ${buyerSigned ? 'signed' : ''}`} /> Buyer Signed {buyerSigned && '✓'}</div>
          <div><span className={`dot ${supplierSigned ? 'signed' : ''}`} /> Supplier Signed {supplierSigned && '✓'}</div>
        </div>
      </div>

      {/* ── Main Split Layout ── */}
      <div className="split-layout">
        {/* ── LEFT: PO Content ── */}
        <div className="po-column">
          <div id="po-content-buyer" className="po-content">
            <div className="po-header-card">
              <div className="po-title-section">
                <h1 className="po-number">{po.po_number}</h1>
                <span className={`status-badge ${po.status}`}>{po.status?.toUpperCase()}</span>
              </div>
              <p className="po-date">Created {formatDate(po.created_at)}</p>
              <div className="po-meta-grid">
                <div><strong>Buyer:</strong> {po.buyer_name || '—'}</div>
                <div><strong>Supplier:</strong> {po.supplier_name || '—'}</div>
                <div><strong>Total:</strong> <span className="po-total">{formatCurrency(po.total_amount, po.currency)}</span></div>
              </div>
            </div>

            <div className="company-header">
              <h2>AXO Networks Private Limited</h2>
              <p>Purchase Order • {formatDate(po.created_at)}</p>
            </div>

            <div className="address-grid">
              <div className="address-card">
                <h3><Building size={16} /> Buyer</h3>
                <p><strong>{po.buyer_name || 'Buyer'}</strong></p>
                <p>{po.buyer_address || 'No address'}</p>
                <p>{po.buyer_email}</p>
                <p>{po.buyer_phone}</p>
              </div>
              <div className="address-card">
                <h3><Package size={16} /> Supplier</h3>
                <p><strong>{po.supplier_name || 'Supplier'}</strong></p>
                <p>{po.supplier_address || 'No address'}</p>
                <p>{po.supplier_email}</p>
                <p>{po.supplier_phone}</p>
              </div>
            </div>

            <div className="items-section">
              <h3><Package size={16} /> Order Items</h3>
              <table className="items-table">
                <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                <tbody>
                  {displayItems.map((item: any, i: number) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>{item.qty || 1}</td>
                      <td>{formatCurrency(item.price || po.total_amount, po.currency)}</td>
                      <td>{formatCurrency(item.total || po.total_amount, po.currency)}</td>
                    </tr>
                  ))}
                  <tr className="total-row"><td colSpan={3}>Grand Total</td><td>{formatCurrency(po.total_amount, po.currency)}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="terms-grid">
              <div><strong>Delivery:</strong> <Calendar size={14} /> {formatDate(po.delivery_date)}</div>
              <div><strong>Shipping:</strong> {po.shipping_terms || '—'}</div>
              <div><strong>Payment:</strong> <CreditCard size={14} /> {po.payment_terms || '—'}</div>
            </div>
            {po.notes && <div className="notes"><strong>📝 Notes:</strong> {po.notes}</div>}

            <div className="signatures">
              <div>
                <strong>Buyer Signature:</strong>
                {po.buyer_signature ? (
                  <div>
                    <img src={po.buyer_signature} alt="buyer" />
                    <p style={{ fontSize: '12px', marginTop: '4px', color: '#475569' }}>
                      Signed by: {po.buyer_signed_name || '—'} on {formatDate(po.buyer_signed_date)}
                    </p>
                  </div>
                ) : (
                  <span>Not signed</span>
                )}
              </div>
              <div>
                <strong>Supplier Signature:</strong>
                {po.supplier_signature ? (
                  <div>
                    <img src={po.supplier_signature} alt="supplier" />
                    <p style={{ fontSize: '12px', marginTop: '4px', color: '#475569' }}>
                      Signed by: {po.supplier_signed_name || '—'} on {formatDate(po.supplier_signed_date)}
                    </p>
                  </div>
                ) : (
                  <span>Not signed</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Status Update Button REMOVED for buyer ── */}
        </div>

        {/* ── RIGHT: Panel ── */}
        <div className="panel-column">
          <div className="panel-toggle-group">
            <button
              className={`panel-toggle ${activePanel === 'messages' ? 'active' : ''}`}
              onClick={() => togglePanel('messages')}
            >
              <MessageSquare size={16} /> Messages <span className="badge">{messages.length}</span>
            </button>
            <button
              className={`panel-toggle ${activePanel === 'documents' ? 'active' : ''}`}
              onClick={() => togglePanel('documents')}
            >
              <FileText size={16} /> Documents <span className="badge">{documents.length}</span>
            </button>
          </div>

          <div className="panel-content">
            {activePanel === 'messages' && (
              <div className="messages-panel">
                <div className="messages-container">
                  {messages.length === 0 ? (
                    <div className="empty-state">No messages yet.</div>
                  ) : (
                    messages.map((msg: any) => (
                      <div key={msg.id} className="message-bubble">
                        <strong>{msg.sender_name}</strong> <span className="msg-time">{formatDate(msg.created_at)}</span>
                        <p>{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="message-input">
                  <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." rows={2} />
                  <button onClick={handleSendMessage} disabled={sending}><Send size={18} /></button>
                </div>
              </div>
            )}

            {activePanel === 'documents' && (
              <div className="documents-panel">
                <div className="doc-header">
                  <span>Uploaded Files</span>
                  <button onClick={() => setShowUpload(true)} className="upload-btn"><Upload size={14} /> Upload</button>
                </div>
                {documents.length === 0 ? (
                  <div className="empty-state">No documents attached.</div>
                ) : (
                  documents.map((doc: any) => (
                    <div key={doc.id} className="doc-item">
                      <div><FileText size={14} /> {doc.original_name} <span>({Math.round(doc.file_size / 1024)} KB)</span></div>
                      <div className="doc-actions">
                        <button onClick={() => handleView(doc.filename)} title="View"><Eye size={14} /></button>
                        <button onClick={() => handleDownload(doc.filename, doc.original_name)} title="Download"><Download size={14} /></button>
                        <button onClick={() => handleDeleteDocument(doc.id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {!activePanel && (
              <div className="panel-placeholder">
                <MessageSquare size={40} color="#cbd5e1" />
                <p>Select a panel to view messages or documents</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Signature Modal ── */}
      {showSignaturePad && (
        <div className="modal-overlay" onClick={() => setShowSignaturePad(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sign as Buyer</h3>
              <button onClick={() => setShowSignaturePad(false)}><X size={24} /></button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Full Name *</label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your full name as it appears on legal documents"
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Signed Date *</label>
              <input
                type="date"
                value={signedDate}
                onChange={(e) => setSignedDate(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Draw Signature</label>
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 400,
                  height: 140,
                  style: { width: '100%', height: '140px', border: '1px solid #e2e8f0', borderRadius: '12px' }
                }}
                backgroundColor="white"
                penColor="black"
              />
            </div>

            <div className="modal-actions">
              <button onClick={clearSignature} className="cancel-btn">Clear</button>
              <button onClick={handleSign} disabled={signing} className="confirm-btn">
                {signing ? 'Saving...' : 'Sign & Confirm'}
              </button>
              <button onClick={() => setShowSignaturePad(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Upload Document</h3><button onClick={() => setShowUpload(false)}><X size={24} /></button></div>
            <div className={`drop-zone ${isDragging ? 'dragging' : ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => document.getElementById('file-input')?.click()}>
              <Upload size={48} />
              <p>{selectedFile ? selectedFile.name : 'Drag & drop your file here'}</p>
              <p className="sub">{selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'or click to browse'}</p>
              <input id="file-input" type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="*/*" />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowUpload(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleUpload} disabled={uploading || !selectedFile} className="confirm-btn">{uploading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .page-container { max-width: 1440px; margin: 0 auto; padding: 24px; background: #f8fafc; min-height: 100vh; }
        .page-loader { padding: 40px; text-align: center; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
        .back-btn { display: flex; align-items: center; gap: 6px; background: white; border: none; padding: 8px 16px; border-radius: 40px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s; }
        .back-btn:hover { transform: translateX(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .pdf-btn { display: flex; align-items: center; gap: 8px; padding: 10px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 40px; cursor: pointer; font-weight: 500; box-shadow: 0 2px 8px rgba(16,185,129,0.2); transition: all 0.2s; }
        .pdf-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16,185,129,0.3); }
        .sign-btn-header { display: flex; align-items: center; gap: 8px; padding: 10px 24px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; border-radius: 40px; cursor: pointer; font-weight: 500; box-shadow: 0 2px 8px rgba(245,158,11,0.2); transition: all 0.2s; }
        .sign-btn-header:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245,158,11,0.3); }

        .timeline-section { background: white; border-radius: 20px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid #eef2f6; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .timeline-steps { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: center; }
        .step-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .step-circle { width: 34px; height: 34px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; color: white; transition: all 0.4s; }
        .step-circle.active { background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
        .step-label { font-size: 10px; font-weight: 400; color: #64748b; transition: all 0.3s; }
        .step-label.current { font-weight: 600; color: #2d3561; }
        .step-line { flex: 1; height: 2px; min-width: 20px; background: #e2e8f0; transition: background 0.4s; }
        .step-line.active { background: #10b981; }
        .signature-indicators { display: flex; gap: 24px; justify-content: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid #eef2f6; font-size: 13px; }
        .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #e2e8f0; margin-right: 6px; }
        .dot.signed { background: #10b981; }

        .split-layout { display: grid; grid-template-columns: 1fr 420px; gap: 24px; margin-bottom: 28px; }
        @media (max-width: 1024px) { .split-layout { grid-template-columns: 1fr; } }

        .po-column { min-width: 0; }
        .po-content { background: white; border-radius: 24px; border: 1px solid #eef2f6; box-shadow: 0 4px 12px rgba(0,0,0,0.04); overflow: hidden; padding: 24px; }
        .po-header-card { margin-bottom: 20px; }
        .po-title-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 6px; }
        .po-number { font-size: 28px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px; }
        .status-badge { padding: 4px 16px; border-radius: 40px; font-weight: 500; font-size: 13px; text-transform: uppercase; }
        .status-badge.issued { background: #e3f2fd; color: #1565c0; }
        .status-badge.accepted { background: #e8f5e9; color: #2e7d32; }
        .status-badge.production { background: #f3e5f5; color: #7b1fa2; }
        .status-badge.shipped { background: #fff3e0; color: #e65100; }
        .status-badge.delivered { background: #d1fae5; color: #065f46; }
        .po-date { color: #64748b; font-size: 13px; margin-bottom: 8px; }
        .po-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 12px; font-size: 14px; }
        .po-total { font-size: 20px; font-weight: 700; color: #2d3561; }

        .company-header { text-align: center; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 2px solid #eef2f6; }
        .company-header h2 { font-size: 22px; font-weight: 700; color: #1e293b; margin: 0; }
        .company-header p { font-size: 13px; color: #64748b; margin-top: 4px; }

        .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .address-card { background: #f8fafc; border-radius: 16px; padding: 16px; }
        .address-card h3 { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #2d3561; margin-bottom: 10px; }
        .address-card p { margin: 4px 0; font-size: 13px; }

        .items-section { margin-bottom: 20px; }
        .items-section h3 { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        .items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .items-table th { text-align: left; padding: 10px 12px; background: #f1f5f9; }
        .items-table td { padding: 10px 12px; border-bottom: 1px solid #eef2f6; }
        .items-table .total-row { font-weight: bold; border-top: 2px solid #eef2f6; background: #f8fafc; }

        .terms-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap: 12px; padding: 14px; background: #f8fafc; border-radius: 12px; margin-bottom: 16px; }
        .notes { padding: 12px; background: #fffbeb; border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 16px; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding-top: 16px; border-top: 1px solid #eef2f6; margin-top: 16px; }
        .signatures img { max-width: 140px; margin-top: 6px; border: 1px solid #e2e8f0; border-radius: 8px; }

        .panel-column { background: white; border-radius: 24px; border: 1px solid #eef2f6; box-shadow: 0 4px 12px rgba(0,0,0,0.04); display: flex; flex-direction: column; overflow: hidden; }
        .panel-toggle-group { display: flex; border-bottom: 1px solid #eef2f6; }
        .panel-toggle { flex: 1; padding: 14px 16px; background: transparent; border: none; cursor: pointer; font-weight: 500; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; color: #64748b; position: relative; }
        .panel-toggle.active { color: #2d3561; background: #f8fafc; border-bottom: 2px solid #2d3561; }
        .panel-toggle .badge { background: #e2e8f0; color: #475569; padding: 0 8px; border-radius: 12px; font-size: 11px; }
        .panel-toggle.active .badge { background: #2d3561; color: white; }

        .panel-content { flex: 1; padding: 20px; overflow-y: auto; max-height: 600px; }
        .panel-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #94a3b8; gap: 12px; }
        .panel-placeholder p { font-size: 14px; margin: 0; }

        .messages-panel { display: flex; flex-direction: column; height: 100%; }
        .messages-container { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; max-height: 400px; }
        .message-bubble { padding: 12px 16px; background: #f8fafc; border-radius: 16px; border: 1px solid #eef2f6; }
        .message-bubble strong { font-size: 13px; }
        .msg-time { font-size: 11px; color: #94a3b8; margin-left: 8px; }
        .message-bubble p { margin: 4px 0 0; font-size: 14px; color: #1e293b; }
        .message-input { display: flex; gap: 10px; }
        .message-input textarea { flex: 1; padding: 10px; border: 1px solid #e2e8f0; border-radius: 20px; resize: none; font-family: inherit; font-size: 13px; }
        .message-input button { padding: 0 18px; background: #2d3561; color: white; border: none; border-radius: 40px; cursor: pointer; }

        .documents-panel { display: flex; flex-direction: column; height: 100%; }
        .doc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-weight: 600; }
        .upload-btn { display: flex; align-items: center; gap: 4px; padding: 4px 12px; background: #2d3561; color: white; border: none; border-radius: 40px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
        .upload-btn:hover { transform: scale(1.02); }
        .doc-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #f8fafc; border-radius: 12px; margin-bottom: 6px; font-size: 13px; }
        .doc-item span { color: #94a3b8; font-size: 11px; margin-left: 4px; }
        .doc-actions { display: flex; gap: 6px; }
        .doc-actions button { background: none; border: none; cursor: pointer; color: #64748b; transition: all 0.2s; }
        .doc-actions button:hover { color: #2d3561; transform: scale(1.1); }
        .empty-state { text-align: center; padding: 30px; color: #94a3b8; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; border-radius: 32px; padding: 32px; width: 500px; max-width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .drop-zone { border: 2px dashed #e2e8f0; border-radius: 16px; padding: 30px 20px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 16px; }
        .drop-zone.dragging { border-color: #2d3561; background: #f0f4ff; }
        .drop-zone .sub { font-size: 13px; color: #94a3b8; margin-top: 4px; }
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .cancel-btn { padding: 8px 20px; background: #e2e8f0; border: none; border-radius: 40px; cursor: pointer; }
        .confirm-btn { padding: 8px 24px; background: #2d3561; color: white; border: none; border-radius: 40px; cursor: pointer; font-weight: 500; }
        .confirm-btn:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }

        @media (max-width: 1024px) { .split-layout { grid-template-columns: 1fr; } .panel-column { min-height: 320px; } .panel-content { max-height: 400px; } }
        @media (max-width: 768px) { .address-grid { grid-template-columns: 1fr; } .signatures { grid-template-columns: 1fr; } .page-header { flex-direction: column; align-items: stretch; gap: 12px; } .pdf-btn, .sign-btn-header { justify-content: center; } .po-title-section { flex-direction: column; align-items: flex-start; } }
      `}</style>
    </div>
  );
};

export default OrderDetailsPage;
