import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Printer, Truck, Calendar, CreditCard, Package, CheckCircle, Clock, MessageSquare, FileText, Send, Pen, Paperclip, Image as ImageIcon } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { PurchaseOrder, Message } from '../../types/real.types';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'messages'>('details');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    try {
      const [poData, messagesData] = await Promise.all([
        realApi.getPOById(id!),
        realApi.getMessages(id!)
      ]);
      setPo(poData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading PO:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const message = await realApi.sendMessage(id!, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPDF = () => {
    const printContent = document.getElementById('po-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write(`
        <html><head><title>PO ${po?.poNumber}</title>
        <style>
          body{font-family:Arial;padding:40px}
          table{border-collapse:collapse;width:100%;margin:20px 0}
          th,td{border:1px solid #ddd;padding:8px;text-align:left}
          .header{text-align:center;margin-bottom:30px}
          .signature{display:flex;justify-content:space-between;margin-top:40px}
        </style>
        </head><body>${printContent.innerHTML}</body></html>
      `);
      printWindow?.document.close();
      printWindow?.print();
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading order details...</div>;
  if (!po) return <div style={{ padding: '40px', textAlign: 'center' }}>Purchase Order not found</div>;

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'delivered': return <CheckCircle size={16} color="#10b981" />;
      case 'shipped': return <Truck size={16} color="#3b82f6" />;
      case 'production': return <Package size={16} color="#f59e0b" />;
      default: return <Clock size={16} color="#94a3b8" />;
    }
  };

  const milestones = po.milestones || [
    { id: '1', name: 'PO Accepted', description: 'Supplier accepts the purchase order', order: 1, status: po.status === 'accepted' ? 'completed' : 'pending' },
    { id: '2', name: 'Production Started', description: 'Manufacturing process begins', order: 2, status: po.status === 'production' ? 'completed' : po.status === 'accepted' ? 'in_progress' : 'pending' },
    { id: '3', name: 'Quality Control', description: 'Inspection and testing', order: 3, status: po.status === 'qc' ? 'in_progress' : 'pending' },
    { id: '4', name: 'Shipped', description: 'Order dispatched', order: 4, status: po.status === 'shipped' ? 'completed' : 'pending' },
    { id: '5', name: 'Delivered', description: 'Order received by buyer', order: 5, status: po.status === 'delivered' ? 'completed' : 'pending' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/buyer/orders')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
          <ChevronLeft size={20} /> Back to Orders
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
            <Printer size={16} /> Print
          </button>
          <button onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      <div id="po-content">
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', border: '1px solid #eef2f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Purchase Order {po.poNumber}</h1>
              <p style={{ color: '#666', marginTop: '4px' }}>Issued: {formatDate(po.createdAt)}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: po.status === 'delivered' ? '#e8f5e9' : '#fff3e0', color: po.status === 'delivered' ? '#2e7d32' : '#e65100' }}>
              {getStatusIcon(po.status)} {po.status?.toUpperCase()}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
            <div>
              <h4 style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>BUYER</h4>
              <p style={{ fontWeight: '500' }}>{po.buyerName}</p>
              <p style={{ fontSize: '14px', color: '#666' }}>{po.buyerAddress}</p>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>SUPPLIER</h4>
              <p style={{ fontWeight: '500' }}>{po.supplierName}</p>
              <p style={{ fontSize: '14px', color: '#666' }}>{po.supplierAddress}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} color="#666" /> Delivery: {formatDate(po.deliveryDate)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={16} color="#666" /> Shipping: {po.shippingTerms}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard size={16} color="#666" /> Payment: {po.paymentTerms}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Item</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Part #</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Quantity</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
               </tr>
            </thead>
            <tbody>
              {po.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eef2f6' }}>
                  <td style={{ padding: '12px' }}>{item.partName}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{item.partNumber || '-'}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={4} style={{ padding: '12px', textAlign: 'right' }}>Subtotal</td><td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(po.subtotal)}</td></tr>
              <tr><td colSpan={4} style={{ padding: '12px', textAlign: 'right' }}>Tax</td><td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(po.tax)}</td></tr>
              <tr><td colSpan={4} style={{ padding: '12px', textAlign: 'right' }}>Shipping</td><td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(po.shippingCost)}</td></tr>
              <tr style={{ borderTop: '1px solid #e2e8f0' }}><td colSpan={4} style={{ padding: '12px', textAlign: 'right', fontWeight: '700' }}>Total</td><td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#2d3561' }}>{formatCurrency(po.totalAmount)}</td></tr>
            </tfoot>
          </table>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #eef2f6' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>Digital Signatures</h4>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Buyer Signature</p>
                {signature ? (
                  <img src={signature} alt="Buyer Signature" style={{ maxWidth: '200px', maxHeight: '60px', borderBottom: '1px solid #ccc', paddingBottom: '8px' }} />
                ) : (
                  <div onClick={() => setShowSignaturePad(true)} style={{ width: '200px', height: '60px', border: '1px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Pen size={20} color="#666" /> Click to Sign
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Supplier Signature</p>
                <div style={{ width: '200px', height: '60px', border: '1px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#999' }}>{po.supplierSignature ? 'Signed' : 'Awaiting signature'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', width: 'fit-content', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('details')} style={{ padding: '8px 20px', borderRadius: '8px', background: activeTab === 'details' ? 'white' : 'transparent', border: 'none', fontWeight: '500', cursor: 'pointer' }}>📋 Details</button>
        <button onClick={() => setActiveTab('timeline')} style={{ padding: '8px 20px', borderRadius: '8px', background: activeTab === 'timeline' ? 'white' : 'transparent', border: 'none', fontWeight: '500', cursor: 'pointer' }}>⏱️ Timeline</button>
        <button onClick={() => setActiveTab('messages')} style={{ padding: '8px 20px', borderRadius: '8px', background: activeTab === 'messages' ? 'white' : 'transparent', border: 'none', fontWeight: '500', cursor: 'pointer' }}>💬 Messages ({messages.length})</button>
      </div>

      {activeTab === 'timeline' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #eef2f6' }}>
          {milestones.map((milestone, idx) => (
            <div key={milestone.id} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: milestone.status === 'completed' ? '#e8f5e9' : milestone.status === 'in_progress' ? '#fff3e0' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {milestone.status === 'completed' ? <CheckCircle size={20} color="#10b981" /> : milestone.status === 'in_progress' ? <Clock size={20} color="#f59e0b" /> : <div style={{ fontWeight: '600' }}>{idx + 1}</div>}
              </div>
              <div>
                <h4 style={{ fontWeight: '600' }}>{milestone.name}</h4>
                <p style={{ fontSize: '13px', color: '#666' }}>{milestone.description}</p>
                {milestone.completedAt && <p style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>Completed: {formatDate(milestone.completedAt)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'messages' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eef2f6', display: 'flex', flexDirection: 'column', height: '500px' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>No messages yet. Start a conversation with the supplier.</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.senderRole === 'buyer' ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
                  <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: '12px', background: msg.senderRole === 'buyer' ? '#2d3561' : '#f1f5f9', color: msg.senderRole === 'buyer' ? 'white' : '#333' }}>
                    <p style={{ fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>{msg.senderName}</p>
                    <p style={{ fontSize: '14px' }}>{msg.content}</p>
                    <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6 }}>{formatDateTime(msg.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: '16px', borderTop: '1px solid #eef2f6', display: 'flex', gap: '12px' }}>
            <textarea 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
              placeholder="Type your message..." 
              style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'none' }} 
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()} 
            />
            <button onClick={handleSendMessage} disabled={sending} style={{ padding: '10px 20px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {showSignaturePad && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} onClick={() => setShowSignaturePad(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '16px', padding: '24px', width: '500px', zIndex: 999 }}>
            <h3 style={{ marginBottom: '16px' }}>Digital Signature</h3>
            <p>Signature feature coming soon. For now, please confirm acceptance.</p>
            <button onClick={() => { setSignature('signed'); setShowSignaturePad(false); }} style={{ marginTop: '16px', padding: '8px 16px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Confirm Signature</button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetailsPage;
