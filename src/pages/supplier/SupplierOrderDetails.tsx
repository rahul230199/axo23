import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, Clock, CheckCircle, Truck, Send, MessageSquare, Check, AlertCircle } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { PurchaseOrder, Message } from '../../types/real.types';

const SupplierOrderDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingMilestone, setUpdatingMilestone] = useState(false);
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
        realApi.getSupplierPOById(id!),
        realApi.getMessages(id!)
      ]);
      setPo(poData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading order:', error);
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

  const updateMilestoneStatus = async (milestoneId: string, status: string) => {
    setUpdatingMilestone(true);
    try {
      await realApi.updateMilestone(id!, milestoneId, status);
      await loadData();
    } catch (error) {
      console.error('Error updating milestone:', error);
      alert('Failed to update milestone status');
    } finally {
      setUpdatingMilestone(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading order details...</div>;
  if (!po) return <div style={{ padding: '40px', textAlign: 'center' }}>Order not found</div>;

  const milestones = po.milestones || [
    { id: '1', name: 'Accept PO', description: 'Review and accept the purchase order', order: 1, status: po.status === 'accepted' ? 'completed' : 'pending' },
    { id: '2', name: 'Start Production', description: 'Begin manufacturing', order: 2, status: po.status === 'production' ? 'completed' : po.status === 'accepted' ? 'in_progress' : 'pending' },
    { id: '3', name: 'Quality Control', description: 'Inspect and test products', order: 3, status: po.status === 'qc' ? 'in_progress' : 'pending' },
    { id: '4', name: 'Ship Order', description: 'Dispatch the order', order: 4, status: po.status === 'shipped' ? 'completed' : 'pending' },
    { id: '5', name: 'Complete Delivery', description: 'Order delivered', order: 5, status: po.status === 'delivered' ? 'completed' : 'pending' },
  ];

  const getNextAction = () => {
    const pendingMilestone = milestones.find(m => m.status === 'pending' || m.status === 'in_progress');
    if (!pendingMilestone) return null;
    
    switch(pendingMilestone.name) {
      case 'Accept PO': return { action: 'Accept PO', milestoneId: pendingMilestone.id, status: 'accepted' };
      case 'Start Production': return { action: 'Start Production', milestoneId: pendingMilestone.id, status: 'production' };
      case 'Quality Control': return { action: 'Mark QC Complete', milestoneId: pendingMilestone.id, status: 'qc' };
      case 'Ship Order': return { action: 'Mark as Shipped', milestoneId: pendingMilestone.id, status: 'shipped' };
      default: return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/supplier/orders')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#666', marginBottom: '24px', cursor: 'pointer' }}>
        <ChevronLeft size={20} /> Back to Orders
      </button>

      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #eef2f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Order {po.poNumber}</h1>
            <p style={{ color: '#666', marginTop: '4px' }}>Customer: {po.buyerName}</p>
          </div>
          <div style={{ padding: '6px 16px', borderRadius: '20px', background: po.status === 'delivered' ? '#e8f5e9' : '#fff3e0', color: po.status === 'delivered' ? '#2e7d32' : '#e65100' }}>
            {po.status?.toUpperCase()}
          </div>
        </div>

        {/* Next Action Button */}
        {nextAction && (
          <div style={{ marginBottom: '20px', padding: '16px', background: '#f0f9ff', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: '600', marginBottom: '4px' }}>Next Action Required</p>
              <p style={{ fontSize: '13px', color: '#666' }}>Update the order status to keep the buyer informed</p>
            </div>
            <button 
              onClick={() => updateMilestoneStatus(nextAction.milestoneId, nextAction.status)}
              disabled={updatingMilestone}
              style={{ padding: '8px 20px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Check size={16} /> {nextAction.action}
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
          <div><h4 style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Delivery Date</h4><p>{formatDate(po.deliveryDate)}</p></div>
          <div><h4 style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Total Amount</h4><p style={{ fontWeight: '600', fontSize: '18px' }}>{formatCurrency(po.totalAmount)}</p></div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #eef2f6' }}>
            <th style={{ padding: '12px 0', textAlign: 'left' }}>Item</th>
            <th style={{ padding: '12px 0', textAlign: 'center' }}>Quantity</th>
            <th style={{ padding: '12px 0', textAlign: 'right' }}>Price</th>
            <th style={{ padding: '12px 0', textAlign: 'right' }}>Total</th>
          </tr></thead>
          <tbody>
            {po.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 0' }}>{item.partName} {item.partNumber && `(${item.partNumber})`}</td>
                <td style={{ padding: '12px 0', textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                <td style={{ padding: '12px 0', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                <td style={{ padding: '12px 0', textAlign: 'right' }}>{formatCurrency(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #eef2f6' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Order Timeline</h3>
        {milestones.map((milestone, idx) => (
          <div key={milestone.id} style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
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

      {/* Chat Section */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eef2f6', display: 'flex', flexDirection: 'column', height: '400px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eef2f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} /> Communication with Buyer
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No messages yet. Start a conversation with the buyer.</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.senderRole === 'supplier' ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
                <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: '12px', background: msg.senderRole === 'supplier' ? '#2d3561' : '#f1f5f9', color: msg.senderRole === 'supplier' ? 'white' : '#333' }}>
                  <p style={{ fontSize: '11px', marginBottom: '4px', opacity: 0.7 }}>{msg.senderName}</p>
                  <p style={{ fontSize: '14px' }}>{msg.content}</p>
                  <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.5 }}>{formatDateTime(msg.createdAt)}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid #eef2f6', display: 'flex', gap: '12px' }}>
          <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'none' }} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()} />
          <button onClick={handleSendMessage} disabled={sending} style={{ padding: '10px 20px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default SupplierOrderDetails;
