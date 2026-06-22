import React, { useEffect, useState } from 'react';
import { Building, Mail, Phone, MapPin, Search, RefreshCw } from 'lucide-react';
import { realApi } from '../../services/realApi';

interface Supplier {
  id: string;
  name: string;
  email: string;
  company_name: string;
  phone: string;
  address: string;
  created_at: string;
}

const SupplierNetworks: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = async () => {
    try {
      setError(null);
      const data = await realApi.getSuppliers();
      console.log('✅ Suppliers loaded:', data);
      setSuppliers(data || []);
    } catch (err: any) {
      console.error('❌ Error loading suppliers:', err);
      setError(err.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSuppliers();
  };

  const filtered = suppliers.filter(s =>
    s.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading supplier networks...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', background: 'linear-gradient(135deg, #1e293b 0%, #2d3561 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Supplier Networks
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Browse and connect with verified suppliers
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '40px', cursor: 'pointer' }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '40px', padding: '8px 16px', maxWidth: '400px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by company, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px solid #eef2f6' }}>
          <Building size={48} color="#94a3b8" />
          <p style={{ marginTop: '16px', color: '#64748b' }}>No suppliers found{searchTerm ? ' matching your search' : ''}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filtered.map((supplier) => (
            <div key={supplier.id} className="hover-lift" style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #2d3561 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '18px' }}>
                    {supplier.company_name?.charAt(0) || supplier.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{supplier.company_name || supplier.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{supplier.name}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} color="#64748b" />
                  <span>{supplier.email}</span>
                </div>
                {supplier.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} color="#64748b" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={16} color="#64748b" />
                    <span>{supplier.address}</span>
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Joined {new Date(supplier.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 20px -12px rgba(0,0,0,0.15); }
      `}</style>
    </div>
  );
};
export default SupplierNetworks;
