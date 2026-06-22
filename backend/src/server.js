const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect((err) => {
  if (err) return console.error('❌ DB error:', err.message);
  console.log('✅ Connected to PostgreSQL');
});

app.use(cors({ origin: ['https://axonetworks.com', 'https://www.axonetworks.com', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

// 🔥 Serve uploaded files with inline disposition (streaming)
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
  console.log(`📁 Requested file: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return res.status(404).send('File not found');
  }
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.csv': 'text/csv',
    '.xml': 'application/xml',
    '.json': 'application/json',
  };
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', 'inline');
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

const JWT_SECRET = process.env.JWT_SECRET || 'axo_super_secret_key';

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

async function generatePONumber() {
  const result = await pool.query("SELECT MAX(po_number) as max FROM purchase_orders");
  let max = result.rows[0].max;
  if (!max) return 'PO-1000';
  let num = parseInt(max.split('-')[1]) + 1;
  return `PO-${num}`;
}

// ========== TIMELINE HELPER ==========
async function addProjectTimeline(projectId, eventType, description, userId) {
  try {
    await pool.query(
      `INSERT INTO project_timeline (project_id, event_type, description, created_by)
       VALUES ($1, $2, $3, $4)`,
      [projectId, eventType, description, userId]
    );
  } catch (err) { console.error('Timeline error:', err); }
}

// ========== NOTIFICATION HELPER ==========
async function createNotification(userId, title, message, link = null) {
  try {
    console.log(`📣 Creating notification for user ${userId}: ${title}`);
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, link, is_read, created_at)
       VALUES ($1, $2, $3, $4, false, NOW()) RETURNING *`,
      [userId, title, message, link]
    );
    io.emit('new_notification', { userId, title, message });
    return result.rows[0];
  } catch (err) {
    console.error('❌ Notification error:', err.message);
    return null;
  }
}

// ========== AUTH ==========
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, password_hash, COALESCE(has_reset_password, false) as has_reset_password FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasResetPassword: user.has_reset_password
      }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/change-password', authenticate, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, has_reset_password = true WHERE id = $2',
      [passwordHash, req.user.id]
    );
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ========== ADMIN & REGISTRATION ==========
app.post('/api/auth/admin-login', async (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@axonetworks.com' && password === 'admin123') {
    const token = jwt.sign({ id: 'admin_1', email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: 'admin_1', email, name: 'Super Admin', role: 'admin' } });
  }
  res.status(401).json({ error: 'Invalid admin credentials' });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, name, role, companyName, phone, address } = req.body;
  try {
    const existingUser = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }
    const existingPending = await pool.query('SELECT email FROM pending_registrations WHERE email = $1', [email]);
    if (existingPending.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Registration already pending approval' });
    }
    await pool.query(
      `INSERT INTO pending_registrations (email, name, role, company_name, phone, address, registered_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'pending')`,
      [email, name, role, companyName, phone, address]
    );
    res.json({ success: true, message: 'Registration submitted. Awaiting admin approval.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/admin/pending-registrations', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, company_name as "companyName", phone, address, registered_at as "registeredAt"
       FROM pending_registrations WHERE status = 'pending' ORDER BY registered_at ASC`
    );
    res.json({ success: true, pending: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/approve-registration', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { registrationId } = req.body;
  try {
    const pending = await pool.query('SELECT * FROM pending_registrations WHERE id = $1', [registrationId]);
    if (pending.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const { email, name, role, company_name, phone, address } = pending.rows[0];
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    await pool.query(
      `INSERT INTO users (email, name, role, company_name, phone, address, username, password_hash, has_reset_password, approved_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, NOW(), NOW())`,
      [email, name, role, company_name, phone, address, username, passwordHash]
    );
    await pool.query('UPDATE pending_registrations SET status = $1 WHERE id = $2', ['approved', registrationId]);
    res.json({ success: true, user: { email, username, tempPassword, name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/reject-registration', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { registrationId } = req.body;
  try {
    await pool.query('UPDATE pending_registrations SET status = $1 WHERE id = $2', ['rejected', registrationId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, company_name as "companyName", phone, address, username,
              created_at as "approvedAt", has_reset_password as "hasResetPassword"
       FROM users ORDER BY created_at DESC`
    );
    res.json({ success: true, users: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== DASHBOARD ==========
app.get('/api/dashboard', authenticate, async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  try {
    if (role === 'buyer') {
      const activeRFQs = await pool.query('SELECT COUNT(*) FROM rfqs WHERE buyer_id = $1 AND status = $2', [userId, 'open']);
      const pendingQuotes = await pool.query('SELECT COUNT(*) FROM quotes WHERE buyer_id = $1 AND status = $2', [userId, 'pending']);
      const activeOrders = await pool.query('SELECT COUNT(*) FROM purchase_orders WHERE buyer_id = $1 AND status IN ($2,$3,$4)', [userId, 'accepted', 'production', 'shipped']);
      const totalSpent = await pool.query('SELECT COALESCE(SUM(total_amount),0) FROM purchase_orders WHERE buyer_id = $1 AND status = $2', [userId, 'delivered']);
      res.json({
        stats: {
          activeRFQs: parseInt(activeRFQs.rows[0].count),
          pendingQuotes: parseInt(pendingQuotes.rows[0].count),
          activeOrders: parseInt(activeOrders.rows[0].count),
          totalSpent: parseFloat(totalSpent.rows[0].coalesce)
        }
      });
    } else if (role === 'supplier') {
      const pendingQuotes = await pool.query('SELECT COUNT(*) FROM quotes WHERE supplier_id = $1 AND status = $2', [userId, 'pending']);
      const activeOrders = await pool.query('SELECT COUNT(*) FROM purchase_orders WHERE supplier_id = $1 AND status IN ($2,$3,$4)', [userId, 'accepted', 'production', 'shipped']);
      const totalEarned = await pool.query('SELECT COALESCE(SUM(total_amount),0) FROM purchase_orders WHERE supplier_id = $1 AND status = $2', [userId, 'delivered']);
      const totalQuotes = await pool.query('SELECT COUNT(*) FROM quotes WHERE supplier_id = $1', [userId]);
      const deliveredOrders = await pool.query('SELECT COUNT(*) FROM purchase_orders WHERE supplier_id = $1 AND status = $2', [userId, 'delivered']);
      const monthlyEarnings = await pool.query(`
        SELECT TO_CHAR(date_trunc('month', created_at), 'Mon') as month, COALESCE(SUM(total_amount), 0) as earnings
        FROM purchase_orders WHERE supplier_id = $1 AND status = 'delivered' AND created_at >= NOW() - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at) ORDER BY date_trunc('month', created_at) ASC
      `, [userId]);
      const orderStatus = await pool.query(`
        SELECT status, COUNT(*) as count FROM purchase_orders WHERE supplier_id = $1 GROUP BY status
      `, [userId]);
      const recentQuotes = await pool.query(`
        SELECT q.*, r.title as rfq_title FROM quotes q JOIN rfqs r ON q.rfq_id = r.id WHERE q.supplier_id = $1 ORDER BY q.submitted_at DESC LIMIT 5
      `, [userId]);
      const recentOrders = await pool.query(`
        SELECT * FROM purchase_orders WHERE supplier_id = $1 ORDER BY created_at DESC LIMIT 5
      `, [userId]);
      const monthsOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const monthlyData = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthsOrder[d.getMonth()];
        const found = monthlyEarnings.rows.find(row => row.month === monthName);
        monthlyData.push({ month: monthName, earnings: found ? parseFloat(found.earnings) : 0 });
      }
      const statusColors = { accepted: '#3b82f6', production: '#f59e0b', shipped: '#8b5cf6', delivered: '#10b981', issued: '#6b7280' };
      const statusData = orderStatus.rows.map(s => ({ name: s.status, value: parseInt(s.count), color: statusColors[s.status] || '#6b7280' }));
      res.json({
        stats: {
          pendingQuotes: parseInt(pendingQuotes.rows[0].count),
          activeOrders: parseInt(activeOrders.rows[0].count),
          totalEarned: parseFloat(totalEarned.rows[0].coalesce),
          totalQuotes: parseInt(totalQuotes.rows[0].count),
          deliveredOrders: parseInt(deliveredOrders.rows[0].count)
        },
        chartData: { monthlyEarnings: monthlyData, orderStatus: statusData },
        recentQuotes: recentQuotes.rows,
        recentOrders: recentOrders.rows
      });
    } else {
      res.json({ stats: {} });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== PROJECTS ==========
app.get('/api/projects', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query('SELECT * FROM projects WHERE buyer_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/projects/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  try {
    const project = await pool.query('SELECT * FROM projects WHERE id = $1 AND buyer_id = $2', [req.params.id, req.user.id]);
    if (project.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const rfqs = await pool.query('SELECT * FROM rfqs WHERE project_id = $1 ORDER BY created_at DESC', [req.params.id]);
    const quotes = await pool.query('SELECT q.*, s.name as supplier_name FROM quotes q LEFT JOIN suppliers s ON q.supplier_id = s.id WHERE q.project_id = $1', [req.params.id]);
    const orders = await pool.query('SELECT * FROM purchase_orders WHERE project_id = $1', [req.params.id]);
    const docs = await pool.query('SELECT * FROM documents WHERE entity_id = $1 AND entity_type = $2', [req.params.id, 'project']);
    const messages = await pool.query('SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.project_id = $1', [req.params.id]);
    const timeline = await pool.query('SELECT * FROM project_timeline WHERE project_id = $1 ORDER BY created_at ASC', [req.params.id]);
    res.json({
      ...project.rows[0],
      rfqs: rfqs.rows,
      quotes: quotes.rows,
      purchase_orders: orders.rows,
      documents: docs.rows,
      messages: messages.rows,
      timeline: timeline.rows
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/projects', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  const { name, description, target_quantity, target_delivery_date, industry, priority } = req.body;
  try {
    const projectNumber = `PRJ-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO projects (project_number, name, description, target_quantity, target_delivery_date, industry, priority, buyer_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW()) RETURNING *`,
      [projectNumber, name, description, target_quantity, target_delivery_date, industry, priority, req.user.id]
    );
    await addProjectTimeline(result.rows[0].id, 'project_created', `Project "${name}" created`, req.user.id);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== RFQs ==========
app.get('/api/rfqs', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query(`SELECT r.*, p.name as project_name FROM rfqs r LEFT JOIN projects p ON r.project_id = p.id WHERE r.buyer_id = $1 ORDER BY r.created_at DESC`, [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/rfqs/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer' && req.user.role !== 'supplier') return res.status(403).json({ error: 'Forbidden' });
  try {
    const rfq = await pool.query('SELECT * FROM rfqs WHERE id = $1', [req.params.id]);
    if (rfq.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'buyer' && rfq.rows[0].buyer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (req.user.role === 'supplier') {
      const quote = await pool.query('SELECT 1 FROM quotes WHERE rfq_id = $1 AND supplier_id = $2', [req.params.id, req.user.id]);
      if (quote.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    }
    const quotes = await pool.query('SELECT q.*, s.name as supplier_name FROM quotes q LEFT JOIN suppliers s ON q.supplier_id = s.id WHERE q.rfq_id = $1', [req.params.id]);
    res.json({ ...rfq.rows[0], quotes: quotes.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/rfqs', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  const {
    project_id, title, description, part_name, part_number,
    quantity, unit, required_delivery_date, required_by,
    delivery_location, payment_terms, ppap_level,
    quality_requirements, special_instructions, special_requirements
  } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM rfqs WHERE project_id = $1', [project_id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'This project already has an RFQ. Only one RFQ is allowed per project.' });
    }
    const rfqNumber = `RFQ-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO rfqs (
        rfq_number, project_id, buyer_id, title, description,
        part_name, part_number, quantity, unit,
        required_delivery_date, required_by, delivery_location,
        payment_terms, ppap_level, quality_requirements,
        special_instructions, special_requirements, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'open', NOW()) RETURNING *`,
      [
        rfqNumber, project_id, req.user.id, title, description,
        part_name, part_number, quantity, unit,
        required_delivery_date, required_by, delivery_location,
        payment_terms, ppap_level, quality_requirements,
        special_instructions, special_requirements
      ]
    );
    await pool.query('UPDATE projects SET status = $1 WHERE id = $2', ['quoting', project_id]);
    await addProjectTimeline(project_id, 'rfq_created', `RFQ "${title}" created`, req.user.id);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== SUPPLIER RFQS ==========
app.get('/api/supplier/rfqs', authenticate, async (req, res) => {
  if (req.user.role !== 'supplier') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query(`
      SELECT r.*, p.name as project_name FROM rfqs r JOIN projects p ON r.project_id = p.id
      WHERE r.status = 'open' AND NOT EXISTS (SELECT 1 FROM quotes q WHERE q.rfq_id = r.id AND q.supplier_id = $1)
      ORDER BY r.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/supplier/rfqs/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'supplier') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query(`
      SELECT r.*, p.name as project_name FROM rfqs r JOIN projects p ON r.project_id = p.id WHERE r.id = $1 AND r.status = 'open'
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'RFQ not found or not available' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== QUOTES ==========
app.post('/api/supplier/rfqs/:id/quote', authenticate, async (req, res) => {
  if (req.user.role !== 'supplier') return res.status(403).json({ error: 'Forbidden' });
  const { unitPrice, leadTimeDays, deliveryTerms, paymentTerms, notes, currency } = req.body;
  const rfqId = req.params.id;
  try {
    const rfq = await pool.query('SELECT * FROM rfqs WHERE id = $1', [rfqId]);
    if (rfq.rows.length === 0) return res.status(404).json({ error: 'RFQ not found' });
    const quoteNumber = `QT-${Date.now()}`;
    const totalPrice = unitPrice * rfq.rows[0].quantity;
    const result = await pool.query(
      `INSERT INTO quotes (quote_number, rfq_id, supplier_id, unit_price, total_price, lead_time_days, delivery_terms, payment_terms, notes, valid_until, status, submitted_at, project_id, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() + INTERVAL '30 days', 'pending', NOW(), $10, $11) RETURNING *`,
      [quoteNumber, rfqId, req.user.id, unitPrice, totalPrice, leadTimeDays, deliveryTerms, paymentTerms, notes, rfq.rows[0].project_id, currency || 'USD']
    );
    await pool.query('UPDATE projects SET status = $1 WHERE id = $2', ['quotes_received', rfq.rows[0].project_id]);
    await addProjectTimeline(rfq.rows[0].project_id, 'quote_received', `Quote received from ${req.user.name}`, req.user.id);
    await createNotification(
      rfq.rows[0].buyer_id,
      'New Quote Received',
      `You received a new quote for "${rfq.rows[0].title}" from ${req.user.name}`,
      `/buyer/projects/${rfq.rows[0].project_id}`
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/supplier/quotes', authenticate, async (req, res) => {
  if (req.user.role !== 'supplier') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query('SELECT * FROM quotes WHERE supplier_id = $1 ORDER BY submitted_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== GET SINGLE QUOTE ==========
app.get('/api/quotes/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quotes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Quote not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== ACCEPT QUOTE & CREATE PO (UPDATED WITH USER DETAILS) ==========
app.post('/api/quotes/:quoteId/accept', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  const quoteId = req.params.quoteId;
  try {
    const quote = await pool.query(`
      SELECT q.*, s.name as supplier_name, s.email as supplier_email, s.phone as supplier_phone
      FROM quotes q
      LEFT JOIN suppliers s ON q.supplier_id = s.id
      WHERE q.id = $1
    `, [quoteId]);
    if (quote.rows.length === 0) return res.status(404).json({ error: 'Quote not found' });
    const rfq = await pool.query('SELECT * FROM rfqs WHERE id = $1', [quote.rows[0].rfq_id]);
    if (rfq.rows.length === 0) return res.status(404).json({ error: 'RFQ not found' });
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [rfq.rows[0].project_id]);
    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found' });

    // 🔥 Fetch buyer and supplier details from users table
    const buyer = await pool.query('SELECT name, email, phone, address FROM users WHERE id = $1', [req.user.id]);
    const supplier = await pool.query('SELECT name, email, phone, address FROM users WHERE id = $1', [quote.rows[0].supplier_id]);

    const buyerName = buyer.rows[0]?.name || '';
    const buyerEmail = buyer.rows[0]?.email || '';
    const buyerPhone = buyer.rows[0]?.phone || '';
    const buyerAddress = buyer.rows[0]?.address || '';
    const supplierName = supplier.rows[0]?.name || '';
    const supplierEmail = supplier.rows[0]?.email || '';
    const supplierPhone = supplier.rows[0]?.phone || '';
    const supplierAddress = supplier.rows[0]?.address || '';

    const poNumber = await generatePONumber();
    let deliveryDate = rfq.rows[0].required_delivery_date;
    if (!deliveryDate) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 30);
      deliveryDate = fallback.toISOString().split('T')[0];
    }
    const items = [{
      name: rfq.rows[0].part_name,
      description: rfq.rows[0].description,
      quantity: rfq.rows[0].quantity,
      unit: rfq.rows[0].unit,
      unit_price: quote.rows[0].unit_price,
      total: quote.rows[0].total_price
    }];

    const result = await pool.query(
      `INSERT INTO purchase_orders
        (po_number, rfq_id, quote_id, buyer_id, supplier_id, delivery_date, shipping_terms, payment_terms,
         subtotal, tax, shipping_cost, total_amount, items,
         buyer_name, buyer_phone, buyer_email, buyer_address,
         supplier_name, supplier_phone, supplier_email, supplier_address,
         status, created_at, project_id, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
               $14, $15, $16, $17, $18, $19, $20, $21, 'issued', NOW(), $22, $23)
       RETURNING *`,
      [
        poNumber, quote.rows[0].rfq_id, quoteId, req.user.id, quote.rows[0].supplier_id,
        deliveryDate, 'FOB', quote.rows[0].payment_terms || 'Net 30',
        quote.rows[0].total_price, 0, 0, quote.rows[0].total_price, JSON.stringify(items),
        buyerName, buyerPhone, buyerEmail, buyerAddress,
        supplierName, supplierPhone, supplierEmail, supplierAddress,
        project.rows[0].id, quote.rows[0].currency || 'USD'
      ]
    );
    await pool.query('UPDATE quotes SET status = $1 WHERE id = $2', ['accepted', quoteId]);
    await pool.query('UPDATE rfqs SET status = $1 WHERE id = $2', ['closed', rfq.rows[0].id]);
    await pool.query('UPDATE projects SET status = $1 WHERE id = $2', ['po_issued', project.rows[0].id]);
    await addProjectTimeline(project.rows[0].id, 'po_created', `PO ${poNumber} created`, req.user.id);
    await createNotification(
      quote.rows[0].supplier_id,
      'PO Created',
      `A purchase order has been created for your quote on "${rfq.rows[0].title}"`,
      `/supplier/orders/${result.rows[0].id}`
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in accept quote:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== PURCHASE ORDERS ==========
app.get('/api/pos', authenticate, async (req, res) => {
  if (req.user.role === 'buyer') {
    const result = await pool.query('SELECT * FROM purchase_orders WHERE buyer_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } else if (req.user.role === 'supplier') {
    const result = await pool.query('SELECT * FROM purchase_orders WHERE supplier_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
});

app.get('/api/pos/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'buyer' && result.rows[0].buyer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (req.user.role === 'supplier' && result.rows[0].supplier_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== STATUS UPDATE WITH NOTES ==========
app.put('/api/pos/:id/status', authenticate, async (req, res) => {
  const { status, notes } = req.body;
  try {
    const po = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [req.params.id]);
    if (po.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'supplier' && po.rows[0].supplier_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (req.user.role === 'buyer' && po.rows[0].buyer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await pool.query('UPDATE purchase_orders SET status = $1 WHERE id = $2', [status, req.params.id]);
    if (status === 'delivered') {
      await pool.query('UPDATE projects SET status = $1 WHERE id = $2', ['completed', po.rows[0].project_id]);
    }
    const description = notes ? `Order status changed to ${status}. Notes: ${notes}` : `Order status changed to ${status}`;
    await addProjectTimeline(po.rows[0].project_id, 'po_status_changed', description, req.user.id);
    const otherUserId = req.user.role === 'buyer' ? po.rows[0].supplier_id : po.rows[0].buyer_id;
    await createNotification(
      otherUserId,
      'Order Status Updated',
      `PO ${po.rows[0].po_number} status changed to "${status}"${notes ? ` with notes: ${notes}` : ''}`,
      `/${req.user.role === 'buyer' ? 'supplier' : 'buyer'}/orders/${req.params.id}`
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/pos/:id', authenticate, async (req, res) => {
  const { delivery_date, items, total_amount, shipping_terms, payment_terms, notes } = req.body;
  try {
    const po = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [req.params.id]);
    if (po.rows.length === 0) return res.status(404).json({ error: 'PO not found' });
    if (po.rows[0].status !== 'issued') return res.status(400).json({ error: 'PO cannot be edited after acceptance' });
    if (req.user.role !== 'buyer' || po.rows[0].buyer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const result = await pool.query(
      `UPDATE purchase_orders SET delivery_date = COALESCE($1, delivery_date), items = COALESCE($2, items), total_amount = COALESCE($3, total_amount),
       shipping_terms = COALESCE($4, shipping_terms), payment_terms = COALESCE($5, payment_terms), notes = COALESCE($6, notes)
       WHERE id = $7 RETURNING *`,
      [delivery_date, items ? JSON.stringify(items) : null, total_amount, shipping_terms, payment_terms, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== MESSAGES ==========
app.get('/api/pos/:id/messages', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.po_id = $1 ORDER BY m.created_at ASC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/pos/:id/messages', authenticate, async (req, res) => {
  const { content } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO messages (po_id, sender_id, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *
    `, [req.params.id, req.user.id, content]);
    io.emit('new_message', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== PROJECT MESSAGES ==========
app.post('/api/projects/:id/messages', authenticate, async (req, res) => {
  const { content } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO messages (project_id, sender_id, content, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [req.params.id, req.user.id, content]
    );
    await addProjectTimeline(req.params.id, 'message_sent', `New message from ${req.user.name}`, req.user.id);
    io.emit('new_project_message', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== SIGNATURES (UPDATED – accepts name & signedDate) ==========
app.post('/api/pos/:id/sign', authenticate, async (req, res) => {
  const { signatureData, role, name, signedDate } = req.body;
  try {
    const field = role === 'buyer' ? 'buyer_signature' : 'supplier_signature';
    const nameField = role === 'buyer' ? 'buyer_signed_name' : 'supplier_signed_name';
    const dateField = role === 'buyer' ? 'buyer_signed_date' : 'supplier_signed_date';
    const timeField = role === 'buyer' ? 'buyer_signed_at' : 'supplier_signed_at';

    const signedDateValue = signedDate || new Date();

    await pool.query(
      `UPDATE purchase_orders
       SET ${field} = $1,
           ${nameField} = $2,
           ${dateField} = $3,
           ${timeField} = NOW()
       WHERE id = $4`,
      [signatureData, name, signedDateValue, req.params.id]
    );

    const po = await pool.query('SELECT project_id FROM purchase_orders WHERE id = $1', [req.params.id]);
    if (po.rows.length > 0) {
      await addProjectTimeline(po.rows[0].project_id, 'signature_added', `${role} signed the PO`, req.user.id);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== TIMELINE ==========
app.get('/api/pos/:id/timeline', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM po_timeline WHERE po_id = $1 ORDER BY created_at ASC', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== DOCUMENTS ==========
const upload = multer({ dest: 'uploads/' });

app.get('/api/documents', authenticate, async (req, res) => {
  const { entityId, entityType } = req.query;
  try {
    let query = 'SELECT * FROM documents WHERE 1=1';
    const params = [];
    if (entityId) { params.push(entityId); query += ` AND entity_id = $${params.length}`; }
    if (entityType) { params.push(entityType); query += ` AND entity_type = $${params.length}`; }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/documents/upload', authenticate, upload.single('file'), async (req, res) => {
  const { entityId, entityType } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await pool.query(
      `INSERT INTO documents (filename, original_name, file_path, file_size, mime_type, entity_id, entity_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [file.filename, file.originalname, file.path, file.size, file.mimetype, entityId, entityType, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ error: err.message, detail: err.detail, code: err.code });
  }
});

app.delete('/api/documents/:id', authenticate, async (req, res) => {
  try {
    const doc = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (doc.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    fs.unlinkSync(doc.rows[0].file_path);
    await pool.query('DELETE FROM documents WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== NOTIFICATIONS ==========
app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== MARK NOTIFICATION AS READ ==========
app.put('/api/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== HEALTH ==========
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// ========== SUPPLIER NETWORKS ==========
app.get('/api/suppliers', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, company_name, phone, address, created_at
       FROM users
       WHERE role = 'supplier' AND company_name IS NOT NULL
       ORDER BY company_name ASC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== START SERVER ==========
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ API ready`);
});
