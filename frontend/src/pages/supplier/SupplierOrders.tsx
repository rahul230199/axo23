import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Eye, Search } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatDate, formatCurrency } from '../../utils/formatters';

const SupplierOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try { const data = await realApi.getPOs(); setOrders(data || []); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const filtered = orders.filter(o =>
    o.po_number.toLowerCase().includes(search.toLowerCase()) ||
    (o.buyer_name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  if (loading) return <div>Loading orders...</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Purchase Orders</h1>
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '40px', padding: '8px 16px', flex: 1, maxWidth: '300px' }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search PO number or buyer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%' }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px' }}>
          <Truck size={48} color="#94a3b8" />
          <p>No orders found</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #eef2f6' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #eef2f6' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left' }}>PO Number</th>
                <th>Buyer</th>
                <th>Total</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/supplier/orders/${order.id}`)}
                  style={{
                    borderBottom: '1px solid #eef2f6',
                    transition: 'background 0.2s, transform 0.2s',
                    cursor: 'pointer'
                  }}
                  className="hover-lift"
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '16px' }}><strong>{order.po_number}</strong></td>
                  <td>{order.buyer_name || '—'}</td>
                  <td>{formatCurrency(order.total_amount, order.currency)}</td>
                  <td>{formatDate(order.delivery_date)}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      background: order.status === 'delivered' ? '#d1fae5' : '#fff3e0',
                      color: order.status === 'delivered' ? '#065f46' : '#92400e'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/supplier/orders/${order.id}`);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Eye size={18} color="#64748b" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default SupplierOrders;
