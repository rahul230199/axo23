import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Globe, CreditCard, Shield, Edit2, Save, X, Star, Award, CheckCircle } from 'lucide-react';

const SupplierProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [profile, setProfile] = useState({
    companyName: 'Precision Manufacturing Co.',
    email: user.email || 'supplier@axonetworks.com',
    phone: '+1 (555) 123-4567',
    address: '123 Industrial Ave, Detroit, MI 48201',
    website: 'www.precisionmfg.com',
    taxId: '88-1234567',
    capabilities: ['CNC Machining', 'Injection Molding', 'Metal Casting', 'PCB Assembly'],
    certifications: ['ISO 9001:2024', 'AS9100D', 'IATF 16949'],
  });

  const [newCapability, setNewCapability] = useState('');
  const [newCert, setNewCert] = useState('');

  const stats = {
    totalOrders: 156,
    onTimeDelivery: 96,
    avgResponseTime: 4.2,
    customerRating: 4.8,
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Supplier Profile</h1>
        <p style={{ color: '#666' }}>Manage your company profile and capabilities</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats.totalOrders}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Total Orders</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{stats.onTimeDelivery}%</div>
          <div style={{ fontSize: '13px', color: '#666' }}>On-Time Delivery</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats.avgResponseTime} hrs</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Avg Response Time</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{stats.customerRating}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Customer Rating</div>
        </div>
      </div>

      {/* Profile Form */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eef2f6', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eef2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Company Information</h3>
          <button onClick={() => setIsEditing(!isEditing)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            {isEditing ? <X size={14} /> : <Edit2 size={14} />} {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div><label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Company Name</label>{isEditing ? <input type="text" value={profile.companyName} onChange={(e) => setProfile({...profile, companyName: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} /> : <p style={{ fontWeight: '500' }}>{profile.companyName}</p>}</div>
          <div><label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Email</label><p>{profile.email}</p></div>
          <div><label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Phone</label>{isEditing ? <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} /> : <p>{profile.phone}</p>}</div>
          <div><label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Website</label>{isEditing ? <input type="text" value={profile.website} onChange={(e) => setProfile({...profile, website: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} /> : <p>{profile.website}</p>}</div>
          <div><label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Address</label>{isEditing ? <textarea value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} /> : <p>{profile.address}</p>}</div>
          <div><label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Tax ID / VAT</label>{isEditing ? <input type="text" value={profile.taxId} onChange={(e) => setProfile({...profile, taxId: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} /> : <p>{profile.taxId}</p>}</div>
        </div>
      </div>

      {/* Capabilities */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eef2f6', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eef2f6' }}><h3 style={{ fontSize: '18px', fontWeight: '600' }}>Manufacturing Capabilities</h3></div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {profile.capabilities.map(cap => (<span key={cap} style={{ padding: '6px 14px', background: '#e8f0fe', color: '#2d3561', borderRadius: '20px', fontSize: '13px' }}>{cap}</span>))}
          </div>
          {isEditing && (<div style={{ display: 'flex', gap: '8px' }}><input type="text" placeholder="Add capability" value={newCapability} onChange={(e) => setNewCapability(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} /><button onClick={() => { if(newCapability) setProfile({...profile, capabilities: [...profile.capabilities, newCapability]}); setNewCapability(''); }} style={{ padding: '8px 16px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button></div>)}
        </div>
      </div>

      {/* Certifications */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eef2f6', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eef2f6' }}><h3 style={{ fontSize: '18px', fontWeight: '600' }}>Certifications</h3></div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {profile.certifications.map(cert => (<span key={cert} style={{ padding: '6px 14px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '20px', fontSize: '13px' }}><CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> {cert}</span>))}
          </div>
          {isEditing && (<div style={{ display: 'flex', gap: '8px' }}><input type="text" placeholder="Add certification" value={newCert} onChange={(e) => setNewCert(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} /><button onClick={() => { if(newCert) setProfile({...profile, certifications: [...profile.certifications, newCert]}); setNewCert(''); }} style={{ padding: '8px 16px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button></div>)}
        </div>
      </div>

      {isEditing && (<div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}><button onClick={() => setIsEditing(false)} style={{ padding: '10px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Save size={16} style={{ display: 'inline', marginRight: '6px' }} /> Save Changes</button></div>)}
    </div>
  );
};

export default SupplierProfile;
