import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, CreditCard, Shield, Edit2, Save, X, CheckCircle } from 'lucide-react';
import { useProfile } from '../../hooks/useBuyerData';

const BuyerProfilePage: React.FC = () => {
  const { data: profile, loading, refetch } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        taxId: profile.taxId || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setIsEditing(false);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Company Profile</h1>
          <p style={{ color: '#6b7280' }}>Manage your company information and preferences</p>
        </div>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: isEditing ? '#10b981' : '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>
          {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#d1fae5', borderRadius: '12px', marginBottom: '24px', color: '#065f46' }}>
          <CheckCircle size={18} /> Profile updated successfully!
        </div>
      )}

      {/* Profile Sections */}
      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}><Building2 size={20} /> Company Information</h3>
        </div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Company Name</label>
            {isEditing ? <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px' }} /> : <p style={{ fontWeight: '500' }}>{formData.companyName || 'Not set'}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Email Address</label>
            {isEditing ? <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px' }} /> : <p>{formData.email}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Phone Number</label>
            {isEditing ? <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px' }} /> : <p>{formData.phone || 'Not set'}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Address</label>
            {isEditing ? <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px' }} /> : <p>{formData.address || 'Not set'}</p>}
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}><CreditCard size={20} /> Tax & Banking</h3>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ maxWidth: '400px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Tax ID / VAT Number</label>
            {isEditing ? <input type="text" value={formData.taxId} onChange={(e) => setFormData({ ...formData, taxId: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px' }} /> : <p>{formData.taxId || 'Not set'}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfilePage;
