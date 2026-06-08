import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Package, DollarSign, TrendingUp } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardData } from '../../hooks/useRealData';
import { formatCurrency } from '../../utils/formatters';

const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { data, loading } = useDashboardData();
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; orders: number; spend: number }>>([]);
  const [statusData, setStatusData] = useState<Array<{ name: string; value: number; color: string }>>([]);

  useEffect(() => {
    if (data?.chartData) {
      setMonthlyData(data.chartData.monthly);
      setStatusData(data.chartData.status);
    } else {
      setMonthlyData([
        { month: 'Jan', orders: 12, spend: 25000 },
        { month: 'Feb', orders: 18, spend: 38000 },
        { month: 'Mar', orders: 22, spend: 45000 },
        { month: 'Apr', orders: 28, spend: 52000 },
        { month: 'May', orders: 32, spend: 68000 },
        { month: 'Jun', orders: 35, spend: 72000 },
      ]);
      setStatusData([
        { name: 'Production', value: 45, color: '#3b82f6' },
        { name: 'QC', value: 25, color: '#8b5cf6' },
        { name: 'Dispatch', value: 15, color: '#10b981' },
        { name: 'Delivered', value: 15, color: '#6b7280' },
      ]);
    }
  }, [data]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>Loading Dashboard...</div>;

  const stats = data?.stats || { activeRFQs: 0, pendingQuotes: 0, activeOrders: 0, totalSpent: 0 };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Welcome back, {user.name || 'User'}! Here's an overview of your sourcing activities.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eef2f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={24} color="#2d3561" /></div>
            <TrendingUp size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' }}>{stats.activeRFQs}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Active RFQs</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eef2f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f3e5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={24} color="#7b1fa2" /></div>
            <TrendingUp size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' }}>{stats.pendingQuotes}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Pending Quotes</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eef2f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={24} color="#2e7d32" /></div>
            <TrendingUp size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' }}>{stats.activeOrders}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Active Orders</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eef2f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={24} color="#e65100" /></div>
            <TrendingUp size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' }}>{formatCurrency(stats.totalSpent)}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Total Spent</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eef2f6' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Monthly Orders Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eef2f6' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '32px', border: '1px solid #eef2f6' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyData}>
            <defs><linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Area type="monotone" dataKey="spend" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpend)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BuyerDashboard;
