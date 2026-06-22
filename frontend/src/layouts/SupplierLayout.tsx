import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Truck, User, LogOut, Menu, X, Bell, ChevronDown } from 'lucide-react';
import { realApi } from '../services/realApi';

const SupplierLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const data = await realApi.getNotifications();
      setNotifications(data || []);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNotificationClick = async (notification: any) => {
    setNotificationsOpen(false);
    if (!notification.is_read) {
      try {
        await realApi.markNotificationRead(notification.id);
        const updated = notifications.map((n: any) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        );
        setNotifications(updated);
        setUnreadCount(updated.filter((n: any) => !n.is_read).length);
      } catch (err) { console.error('Failed to mark notification as read', err); }
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const navItems = [
    { path: '/supplier/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/supplier/rfqs', label: 'Available RFQs', icon: FileText },
    { path: '/supplier/quotes', label: 'My Quotes', icon: MessageSquare },
    { path: '/supplier/orders', label: 'Orders', icon: Truck },
    { path: '/supplier/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{
        width: sidebarOpen ? '260px' : '80px',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        transition: 'width 0.25s ease',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ padding: sidebarOpen ? '24px 20px' : '20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/supplier/dashboard')}>
            <span style={{ fontSize: '28px' }}>🔧</span>
            {sidebarOpen && <span style={{ fontSize: '18px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px' }}>AXO Supplier</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', padding: '6px', cursor: 'pointer', transition: '0.2s' }} className="hover-scale">
            {sidebarOpen ? <ChevronDown size={16} color="white" /> : <Menu size={16} color="white" />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '24px 0' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: sidebarOpen ? '12px 20px' : '14px 0',
                  margin: '4px 12px',
                  borderRadius: '12px',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: active ? 'white' : '#a0aec0',
                  textDecoration: 'none',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  transition: 'all 0.2s'
                }}
                className="hover-lift"
              >
                <Icon size={20} />
                {sidebarOpen && <span style={{ fontSize: '14px', fontWeight: active ? '600' : '400' }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: sidebarOpen ? '16px 20px' : '16px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'transparent',
            border: 'none',
            color: '#a0aec0',
            cursor: 'pointer',
            padding: sidebarOpen ? '10px 12px' : '10px 0',
            borderRadius: '12px',
            width: '100%',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            transition: '0.2s'
          }} className="hover-scale">
            <LogOut size={18} />
            {sidebarOpen && <span style={{ fontSize: '14px' }}>Logout</span>}
          </button>
        </div>
      </div>

      <div style={{ marginLeft: sidebarOpen ? '260px' : '80px', flex: 1, transition: 'margin-left 0.25s ease', minHeight: '100vh' }}>
        <div style={{ padding: '12px 32px', borderBottom: '1px solid #eef2f6', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', position: 'sticky', top: 0, zIndex: 90, backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.8)' }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="hover-scale" style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '6px' }}>
              <Bell size={20} color="#475569" />
              {unreadCount > 0 && <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: 'white', fontSize: '10px', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>}
            </button>
            {notificationsOpen && (
              <div className="animate-scaleIn" style={{ position: 'absolute', top: '36px', right: '0', width: '380px', background: 'white', borderRadius: '20px', boxShadow: '0 20px 35px -8px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: '400px', overflowY: 'auto', border: '1px solid #eef2f6' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #eef2f6', fontWeight: '600' }}>Notifications</div>
                {notifications.length === 0 ? <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No notifications</div> :
                  notifications.map((notif: any) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #eef2f6',
                        background: notif.is_read ? 'white' : '#f0f9ff',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      className="notification-item"
                    >
                      <div style={{ fontWeight: '500', fontSize: '13px' }}>{notif.title}</div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{notif.message}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>{new Date(notif.created_at).toLocaleString()}</div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #2d3561 0%, #1e293b 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {user.name?.charAt(0) || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.name || 'Supplier'}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{user.email || ''}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '32px' }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          div[style*="position: fixed"][style*="width: 80px"],
          div[style*="position: fixed"][style*="width: 260px"] { display: none; }
          div[style*="margin-left: 80px"], div[style*="margin-left: 260px"] { margin-left: 0 !important; }
        }
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 20px -12px rgba(0,0,0,0.15); }
        .hover-scale { transition: transform 0.2s ease; }
        .hover-scale:hover { transform: scale(1.05); }
        .animate-scaleIn { animation: scaleIn 0.2s ease; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .notification-item:hover { background: #f1f5f9; }
      `}</style>
    </div>
  );
};

export default SupplierLayout;
