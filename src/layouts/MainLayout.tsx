import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const MainLayout: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/rfq', label: '📋 RFQ to PO' },
    { path: '/orders', label: '📦 Orders' },
    { path: '/profile', label: '🏢 Organization' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Top Navigation Bar */}
      <nav style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🔗</span>
            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1f2937' }}>AXO NETWORKS</span>
          </div>

          <div style={{ display: 'flex', gap: '32px' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: 'none',
                  color: location.pathname === item.path ? '#2563eb' : '#4b5563',
                  fontWeight: location.pathname === item.path ? '600' : '500',
                  padding: '8px 0',
                  borderBottom: location.pathname === item.path ? '2px solid #2563eb' : 'none'
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', position: 'relative' }}>
              🔔
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '10px',
                borderRadius: '50%',
                padding: '2px 4px'
              }}>3</span>
            </button>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              JD
            </div>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;