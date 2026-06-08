import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, FileText, Package, MessageCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'rfq' | 'order' | 'message';
}

const Notifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Quote Received', message: 'Precision Parts Co submitted a quote for RFQ-001', read: false, createdAt: '2024-01-15T10:30:00', type: 'rfq' },
    { id: '2', title: 'Order Status Updated', message: 'PO-001 has been shipped', read: false, createdAt: '2024-01-14T14:20:00', type: 'order' },
    { id: '3', title: 'New Message', message: 'You have a new message from supplier', read: true, createdAt: '2024-01-13T09:15:00', type: 'message' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch(type) {
      case 'rfq': return <FileText size={16} color="#3b82f6" />;
      case 'order': return <Package size={16} color="#10b981" />;
      case 'message': return <MessageCircle size={16} color="#8b5cf6" />;
      default: return <CheckCircle size={16} />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
      >
        <Bell size={20} color="#666" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: '#ef4444',
            color: 'white',
            fontSize: '10px',
            padding: '2px 5px',
            borderRadius: '10px',
            minWidth: '18px',
            textAlign: 'center'
          }}>{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setIsOpen(false)} />
          <div style={{
            position: 'absolute',
            top: '40px',
            right: '0',
            width: '380px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
            zIndex: 999,
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eef2f6' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} style={{ fontSize: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all as read</button>
              )}
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No notifications</div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '16px 20px',
                      borderBottom: '1px solid #eef2f6',
                      cursor: 'pointer',
                      background: notif.read ? 'white' : '#f0f9ff',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: notif.read ? '#f1f5f9' : '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getIcon(notif.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>{notif.title}</p>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{notif.message}</p>
                      <p style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                    {!notif.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '8px' }} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;
