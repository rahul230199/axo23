import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import Notifications from '../components/Notifications';
import { LayoutDashboard, FileText, Package, User, LogOut, ChevronLeft, ChevronRight, TrendingUp, MessageCircle } from 'lucide-react';

const SupplierLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/supplier/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/supplier/rfq', label: 'Available RFQs', icon: FileText },
    { path: '/supplier/quotes', label: 'My Quotes', icon: TrendingUp },
    { path: '/supplier/orders', label: 'Orders', icon: Package },
    { path: '/supplier/messages', label: 'Messages', icon: MessageCircle },
    { path: '/supplier/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  const sidebarWidth = collapsed ? '80px' : '260px';
  const sidebarBg = '#1a1a2e';
  const textColor = '#a0a0c0';
  const activeBg = '#2d3561';
  const activeColor = '#ffffff';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarWidth, background: sidebarBg, transition: 'width 0.3s', position: 'fixed', height: '100vh', overflowY: 'auto', zIndex: 100, display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: collapsed ? '20px 0' : '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/supplier/dashboard')}>
            <span style={{ fontSize: '28px' }}>🔗</span>
            {!collapsed && <span style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>AXO</span>}
          </div>
          {!collapsed && <button onClick={() => setCollapsed(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}><ChevronLeft size={16} color="white" /></button>}
        </div>
        {collapsed && <button onClick={() => setCollapsed(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '6px', margin: '16px auto', width: '36px', cursor: 'pointer' }}><ChevronRight size={16} color="white" /></button>}
        
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: collapsed ? '14px 0' : '12px 20px',
                margin: '4px 12px', borderRadius: '10px', background: active ? activeBg : 'transparent',
                color: active ? activeColor : textColor, textDecoration: 'none', justifyContent: collapsed ? 'center' : 'flex-start'
              }}>
                <Icon size={20} />
                {!collapsed && <span style={{ fontSize: '14px', fontWeight: active ? '600' : '400' }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        
        <div style={{ padding: collapsed ? '16px 0' : '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', color: textColor, cursor: 'pointer', padding: collapsed ? '10px 0' : '10px 12px', borderRadius: '8px', width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <LogOut size={18} /> {!collapsed && <span style={{ fontSize: '14px' }}>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 101 }}>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: sidebarBg, border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', color: 'white', display: 'none' }} className="mobile-menu-btn">
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={() => setMobileMenuOpen(false)} />}
      <div style={{ position: 'fixed', top: 0, left: mobileMenuOpen ? 0 : '-280px', width: '260px', height: '100vh', background: sidebarBg, zIndex: 100, transition: 'left 0.3s', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '28px' }}>🔗</span><span style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>AXO</span></div></div>
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', margin: '4px 12px', borderRadius: '10px', background: active ? activeBg : 'transparent', color: active ? activeColor : textColor, textDecoration: 'none' }}>
                <Icon size={20} /> <span style={{ fontSize: '14px', fontWeight: active ? '600' : '400' }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', color: textColor, cursor: 'pointer', padding: '10px 12px', borderRadius: '8px', width: '100%' }}>
            <LogOut size={18} /> <span style={{ fontSize: '14px' }}>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: sidebarWidth, flex: 1, transition: 'margin-left 0.3s', minHeight: '100vh' }}>
        <div style={{ background: 'white', padding: '16px 32px', borderBottom: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
          <Notifications />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: '#2d3561', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600' }}>{user?.name?.charAt(0) || 'S'}</div>
            <div><div style={{ fontWeight: '500', fontSize: '14px' }}>{user?.name || 'Supplier'}</div><div style={{ fontSize: '11px', color: '#999' }}>{user?.email || ''}</div></div>
          </div>
        </div>
        <div style={{ padding: '32px' }}><Outlet /></div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          div[style*="position: fixed"][style*="width: 80px"], div[style*="position: fixed"][style*="width: 260px"] { display: none; }
          div[style*="margin-left: 80px"], div[style*="margin-left: 260px"] { margin-left: 0 !important; }
        }
        @media (min-width: 769px) { .mobile-menu-btn { display: none !important; } }
      `}</style>
    </div>
  );
};

export default SupplierLayout;
