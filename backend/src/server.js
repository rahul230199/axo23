const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 5000;

// Data files
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PENDING_FILE = path.join(DATA_DIR, 'pending.json');
const RFQS_FILE = path.join(DATA_DIR, 'rfqs.json');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.json');
const POS_FILE = path.join(DATA_DIR, 'pos.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

// Load data
let users = [];
let pendingRegistrations = [];
let rfqs = [];
let quotes = [];
let purchaseOrders = [];
let messages = [];
let documents = [];
let notifications = [];

try { users = fs.readJsonSync(USERS_FILE); } catch(e) {}
try { pendingRegistrations = fs.readJsonSync(PENDING_FILE); } catch(e) {}
try { rfqs = fs.readJsonSync(RFQS_FILE); } catch(e) {}
try { quotes = fs.readJsonSync(QUOTES_FILE); } catch(e) {}
try { purchaseOrders = fs.readJsonSync(POS_FILE); } catch(e) {}
try { messages = fs.readJsonSync(MESSAGES_FILE); } catch(e) {}
try { documents = fs.readJsonSync(DOCUMENTS_FILE); } catch(e) {}
try { notifications = fs.readJsonSync(NOTIFICATIONS_FILE); } catch(e) {}

// Save functions
const saveUsers = () => fs.writeJsonSync(USERS_FILE, users);
const savePending = () => fs.writeJsonSync(PENDING_FILE, pendingRegistrations);
const saveRFQs = () => fs.writeJsonSync(RFQS_FILE, rfqs);
const saveQuotes = () => fs.writeJsonSync(QUOTES_FILE, quotes);
const savePOs = () => fs.writeJsonSync(POS_FILE, purchaseOrders);
const saveMessages = () => fs.writeJsonSync(MESSAGES_FILE, messages);
const saveDocuments = () => fs.writeJsonSync(DOCUMENTS_FILE, documents);
const saveNotifications = () => fs.writeJsonSync(NOTIFICATIONS_FILE, notifications);

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Helper functions
const generateUsername = (name) => name.toLowerCase().replace(/\s/g, '.') + '@axonetworks.com';
const generateTempPassword = () => Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase();

// ============ AUTH ENDPOINTS ============
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@axonetworks.com' && password === 'admin123') {
    const token = jwt.sign({ id: 'admin_1', email, role: 'admin' }, 'secret', { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: 'admin_1', email, name: 'Super Admin', role: 'admin' } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, name, role, companyName, phone, address } = req.body;
  if (users.find(u => u.email === email) || pendingRegistrations.find(p => p.email === email)) {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }
  pendingRegistrations.push({ id: Date.now().toString(), email, name, role, companyName, phone, address, registeredAt: new Date().toISOString() });
  savePending();
  res.json({ success: true, message: 'Registration submitted for approval' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'secret', { expiresIn: '7d' });
  res.json({ success: true, token, needsReset: user.mustResetPassword || false, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, 'secret');
    const user = users.find(u => u.id === decoded.id);
    if (user) {
      user.password = await bcrypt.hash(newPassword, 10);
      user.mustResetPassword = false;
      saveUsers();
    }
    res.json({ success: true });
  } catch { res.status(400).json({ success: false }); }
});

// ============ ADMIN ENDPOINTS ============
app.get('/api/admin/pending-registrations', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, 'secret');
    if (decoded.role !== 'admin') return res.status(403).json({ success: false });
    res.json({ success: true, pending: pendingRegistrations });
  } catch { res.status(401).json({ success: false }); }
});

app.post('/api/admin/approve-registration', async (req, res) => {
  const { registrationId } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, 'secret');
    if (decoded.role !== 'admin') return res.status(403).json({ success: false });
    const pending = pendingRegistrations.find(p => p.id === registrationId);
    if (!pending) return res.status(404).json({ success: false });
    const username = generateUsername(pending.name);
    const tempPassword = generateTempPassword();
    const newUser = {
      id: `user_${Date.now()}`,
      email: pending.email,
      username,
      name: pending.name,
      role: pending.role,
      companyName: pending.companyName,
      phone: pending.phone,
      address: pending.address,
      password: await bcrypt.hash(tempPassword, 10),
      tempPassword,
      mustResetPassword: true,
      isActive: true,
      approvedAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers();
    const index = pendingRegistrations.findIndex(p => p.id === registrationId);
    pendingRegistrations.splice(index, 1);
    savePending();
    res.json({ success: true, user: { id: newUser.id, email: newUser.email, username: newUser.username, name: newUser.name, role: newUser.role, tempPassword } });
  } catch { res.status(401).json({ success: false }); }
});

app.post('/api/admin/reject-registration', (req, res) => {
  const { registrationId } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, 'secret');
    if (decoded.role !== 'admin') return res.status(403).json({ success: false });
    const index = pendingRegistrations.findIndex(p => p.id === registrationId);
    if (index !== -1) pendingRegistrations.splice(index, 1);
    savePending();
    res.json({ success: true });
  } catch { res.status(401).json({ success: false }); }
});

app.get('/api/admin/users', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = jwt.verify(token, 'secret');
    if (decoded.role !== 'admin') return res.status(403).json({ success: false });
    res.json({ success: true, users: users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, companyName: u.companyName, approvedAt: u.approvedAt })) });
  } catch { res.status(401).json({ success: false }); }
});

// ============ BUYER DASHBOARD ============
app.get('/api/dashboard', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'secret');
    const userRFQs = rfqs.filter(r => r.buyerId === decoded.id);
    const userPOs = purchaseOrders.filter(p => p.buyerId === decoded.id);
    // Generate chart data
    const monthlyData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => ({ month: m, orders: Math.floor(Math.random() * 50) + 20, spend: Math.floor(Math.random() * 50000) + 20000 }));
    const statusData = [
      { name: 'Production', value: 45, color: '#3b82f6' },
      { name: 'QC', value: 25, color: '#8b5cf6' },
      { name: 'Dispatch', value: 15, color: '#10b981' },
      { name: 'Delivered', value: 15, color: '#6b7280' }
    ];
    res.json({
      stats: { activeRFQs: userRFQs.filter(r => r.status === 'open').length, pendingQuotes: 0, activeOrders: userPOs.filter(p => p.status !== 'delivered').length, totalSpent: userPOs.reduce((s, p) => s + (p.total || 0), 0) },
      recentRFQs: userRFQs.slice(-5).reverse(),
      recentOrders: userPOs.slice(-5).reverse(),
      chartData: { monthly: monthlyData, status: statusData }
    });
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
});

// ============ RFQ ENDPOINTS ============
app.get('/api/rfqs', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json([]);
  try {
    const decoded = jwt.verify(token, 'secret');
    res.json(rfqs.filter(r => r.buyerId === decoded.id));
  } catch { res.status(401).json([]); }
});

app.get('/api/rfqs/:id', (req, res) => {
  const rfq = rfqs.find(r => r.id === req.params.id);
  if (!rfq) return res.status(404).json({ error: 'Not found' });
  res.json(rfq);
});

app.post('/api/rfqs', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'secret');
    const newRFQ = { id: `rfq_${Date.now()}`, rfqNumber: `RFQ-${Date.now()}`, buyerId: decoded.id, ...req.body, status: 'draft', createdAt: new Date().toISOString() };
    rfqs.push(newRFQ);
    saveRFQs();
    res.status(201).json(newRFQ);
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
});

app.post('/api/rfqs/:id/publish', (req, res) => {
  const rfq = rfqs.find(r => r.id === req.params.id);
  if (rfq) { rfq.status = 'open'; saveRFQs(); }
  res.json(rfq);
});

// ============ QUOTE ENDPOINTS ============
app.get('/api/rfqs/:rfqId/quotes', (req, res) => {
  res.json(quotes.filter(q => q.rfqId === req.params.rfqId));
});

app.post('/api/quotes/:quoteId/accept', (req, res) => {
  const quote = quotes.find(q => q.id === req.params.quoteId);
  if (quote) {
    const newPO = { id: `po_${Date.now()}`, poNumber: `PO-${Date.now()}`, rfqId: quote.rfqId, quoteId: quote.id, buyerId: quote.buyerId, supplierId: quote.supplierId, total: quote.price, status: 'issued', items: [], createdAt: new Date().toISOString() };
    purchaseOrders.push(newPO);
    savePOs();
    res.json(newPO);
  } else { res.status(404).json({ error: 'Not found' }); }
});

app.post('/api/quotes/:quoteId/reject', (req, res) => {
  const quote = quotes.find(q => q.id === req.params.quoteId);
  if (quote) { quote.status = 'rejected'; saveQuotes(); }
  res.json({ success: true });
});

// ============ PO ENDPOINTS ============
app.get('/api/pos', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json([]);
  try {
    const decoded = jwt.verify(token, 'secret');
    res.json(purchaseOrders.filter(p => p.buyerId === decoded.id));
  } catch { res.status(401).json([]); }
});

app.get('/api/pos/:id', (req, res) => {
  const po = purchaseOrders.find(p => p.id === req.params.id);
  if (!po) return res.status(404).json({ error: 'Not found' });
  res.json(po);
});

app.post('/api/pos', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'secret');
    const newPO = { id: `po_${Date.now()}`, poNumber: `PO-${Date.now()}`, buyerId: decoded.id, ...req.body, status: 'issued', createdAt: new Date().toISOString() };
    purchaseOrders.push(newPO);
    savePOs();
    res.status(201).json(newPO);
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
});

app.put('/api/pos/:id/status', (req, res) => {
  const po = purchaseOrders.find(p => p.id === req.params.id);
  if (po) { po.status = req.body.status; po.updatedAt = new Date().toISOString(); savePOs(); }
  res.json(po || { success: true });
});

// ============ MESSAGE ENDPOINTS ============
app.get('/api/pos/:poId/messages', (req, res) => {
  res.json(messages.filter(m => m.poId === req.params.poId));
});

app.post('/api/pos/:poId/messages', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'secret');
    const newMsg = { id: `msg_${Date.now()}`, poId: req.params.poId, senderId: decoded.id, senderRole: decoded.role, content: req.body.content, createdAt: new Date().toISOString() };
    messages.push(newMsg);
    saveMessages();
    // Create notification
    notifications.push({ id: `notif_${Date.now()}`, userId: decoded.id, title: 'New Message', message: `New message on PO`, read: false, createdAt: new Date().toISOString() });
    saveNotifications();
    res.status(201).json(newMsg);
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
});

// ============ NOTIFICATION ENDPOINTS ============
app.get('/api/notifications', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json([]);
  try {
    const decoded = jwt.verify(token, 'secret');
    res.json(notifications.filter(n => n.userId === decoded.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch { res.status(401).json([]); }
});

app.put('/api/notifications/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (notif) { notif.read = true; saveNotifications(); }
  res.json({ success: true });
});

// ============ DOCUMENT ENDPOINTS ============
app.get('/api/documents', (req, res) => {
  const { entityId, entityType } = req.query;
  let docs = documents;
  if (entityId) docs = docs.filter(d => d.entityId === entityId);
  if (entityType) docs = docs.filter(d => d.entityType === entityType);
  res.json(docs);
});

app.post('/api/documents', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'secret');
    const newDoc = { id: `doc_${Date.now()}`, ...req.body, uploadedBy: decoded.id, createdAt: new Date().toISOString() };
    documents.push(newDoc);
    saveDocuments();
    res.status(201).json(newDoc);
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
});

// ============ SUPPLIER ENDPOINTS ============
app.get('/api/suppliers', (req, res) => {
  const supplierUsers = users.filter(u => u.role === 'supplier' && u.isActive);
  res.json(supplierUsers.map(s => ({ id: s.id, name: s.name, email: s.email, companyName: s.companyName, rating: 4.5, totalOrders: Math.floor(Math.random() * 100) + 10 })));
});

// ============ PROFILE ENDPOINTS ============
app.get('/api/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'secret');
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    const { password, tempPassword, ...profile } = user;
    res.json(profile);
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
});

app.put('/api/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'secret');
    const user = users.find(u => u.id === decoded.id);
    if (user) { Object.assign(user, req.body); saveUsers(); }
    res.json({ success: true });
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
});

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`👑 Admin: admin@axonetworks.com / admin123`);
  console.log(`💾 Data saved to: ${DATA_DIR}\n`);
});
