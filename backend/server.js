const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'axo_react_db',
  password: 'postgres',
  port: 5432,
});

const JWT_SECRET = 'axo_super_secret_key_change_in_production';

async function generatePONumber() {
  const result = await pool.query("SELECT MAX(po_number) as max FROM purchase_orders");
  let max = result.rows[0].max;
  if (!max) return 'PO-1000';
  let num = parseInt(max.split('-')[1]) + 1;
  return `PO-${num}`;
}

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

// ========== AUTH ==========
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, company_name, phone FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== DASHBOARD ==========
app.get('/api/dashboard', authenticate, async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  try {
    if (role === 'buyer') {
      const projects = await pool.query('SELECT COUNT(*) FROM projects WHERE buyer_id = $1', [userId]);
      const rfqs = await pool.query('SELECT COUNT(*) FROM rfqs WHERE buyer_id = $1 AND status = $2', [userId, 'open']);
      const quotes = await pool.query('SELECT COUNT(*) FROM quotes WHERE buyer_id = $1 AND status = $2', [userId, 'pending']);
      const orders = await pool.query('SELECT COUNT(*) FROM purchase_orders WHERE buyer_id = $1 AND status IN ($2,$3,$4)', [userId, 'accepted', 'production', 'shipped']);
      const spent = await pool.query('SELECT COALESCE(SUM(total_amount),0) FROM purchase_orders WHERE buyer_id = $1 AND status = $2', [userId, 'delivered']);
      res.json({
        stats: {
          totalProjects: parseInt(projects.rows[0].count),
          activeRFQs: parseInt(rfqs.rows[0].count),
          pendingQuotes: parseInt(quotes.rows[0].count),
          activeOrders: parseInt(orders.rows[0].count),
          totalSpent: parseFloat(spent.rows[0].coalesce)
        }
      });
    } else if (role === 'supplier') {
      const quotesPending = await pool.query('SELECT COUNT(*) FROM quotes WHERE supplier_id = $1 AND status = $2', [userId, 'pending']);
      const ordersActive = await pool.query('SELECT COUNT(*) FROM purchase_orders WHERE supplier_id = $1 AND status IN ($2,$3,$4)', [userId, 'accepted', 'production', 'shipped']);
      const totalEarned = await pool.query('SELECT COALESCE(SUM(total_amount),0) FROM purchase_orders WHERE supplier_id = $1 AND status = $2', [userId, 'delivered']);
      res.json({
        stats: {
          pendingQuotes: parseInt(quotesPending.rows[0].count),
          activeOrders: parseInt(ordersActive.rows[0].count),
          totalEarned: parseFloat(totalEarned.rows[0].coalesce)
        }
      });
    } else { res.json({ stats: {} }); }
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
    const rfqs = await pool.query('SELECT * FROM rfqs WHERE project_id = $1', [req.params.id]);
    const quotes = await pool.query('SELECT q.*, s.name as supplier_name FROM quotes q JOIN suppliers s ON q.supplier_id = s.id WHERE q.project_id = $1', [req.params.id]);
    const pos = await pool.query('SELECT * FROM purchase_orders WHERE project_id = $1', [req.params.id]);
    const docs = await pool.query('SELECT * FROM documents WHERE project_id = $1', [req.params.id]);
    const messages = await pool.query('SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.project_id = $1 ORDER BY m.created_at', [req.params.id]);
    res.json({ ...project.rows[0], rfqs: rfqs.rows, quotes: quotes.rows, purchase_orders: pos.rows, documents: docs.rows, messages: messages.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/projects', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  const { name, description, target_quantity, target_delivery_date, industry, priority } = req.body;
  try {
    const projectNumber = `PRJ-${Date.now()}`;
    const result = await pool.query(`INSERT INTO projects (project_number, name, description, target_quantity, target_delivery_date, industry, priority, buyer_id, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft', NOW()) RETURNING *`, [projectNumber, name, description, target_quantity, target_delivery_date, industry, priority, req.user.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== RFQs ==========
app.get('/api/rfqs', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query('SELECT r.*, p.name as project_name FROM rfqs r JOIN projects p ON r.project_id = p.id WHERE p.buyer_id = $1 ORDER BY r.created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/rfqs/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  try {
    const rfq = await pool.query('SELECT r.*, p.name as project_name, p.target_delivery_date as project_delivery FROM rfqs r JOIN projects p ON r.project_id = p.id WHERE r.id = $1 AND p.buyer_id = $2', [req.params.id, req.user.id]);
    if (rfq.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const quotes = await pool.query('SELECT q.*, s.name as supplier_name, s.email as supplier_email FROM quotes q JOIN suppliers s ON q.supplier_id = s.id WHERE q.rfq_id = $1', [req.params.id]);
    res.json({ ...rfq.rows[0], quotes: quotes.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/rfqs', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  const { project_id, title, description, part_name, quantity, unit, required_delivery_date, special_requirements } = req.body;
  try {
    const rfqNumber = `RFQ-${Date.now()}`;
    const result = await pool.query(`INSERT INTO rfqs (rfq_number, project_id, buyer_id, title, description, part_name, quantity, unit, required_delivery_date, special_requirements, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'open', NOW()) RETURNING *`, [rfqNumber, project_id, req.user.id, title, description, part_name, quantity, unit, required_delivery_date, special_requirements]);
    io.emit('rfq_created', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/rfqs/:id/publish', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  try {
    const rfq = await pool.query('SELECT * FROM rfqs WHERE id = $1 AND buyer_id = $2', [req.params.id, req.user.id]);
    if (rfq.rows.length === 0) return res.status(404).json({ error: 'RFQ not found' });
    await pool.query('UPDATE rfqs SET status = $1 WHERE id = $2', ['open', req.params.id]);
    io.emit('rfq_published', { rfqId: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== SUPPLIER RFQs ==========
app.get('/api/supplier/rfqs', authenticate, async (req, res) => {
  if (req.user.role !== 'supplier') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query(`SELECT r.*, p.name as project_name, p.buyer_id FROM rfqs r JOIN projects p ON r.project_id = p.id WHERE r.status = 'open' AND NOT EXISTS (SELECT 1 FROM quotes q WHERE q.rfq_id = r.id AND q.supplier_id = $1) ORDER BY r.created_at DESC`, [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/supplier/rfqs/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'supplier') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query(`SELECT r.*, p.name as project_name FROM rfqs r JOIN projects p ON r.project_id = p.id WHERE r.id = $1 AND r.status = 'open'`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'RFQ not found or not available' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== QUOTES ==========
app.post('/api/supplier/rfqs/:id/quote', authenticate, async (req, res) => {
  if (req.user.role !== 'supplier') return res.status(403).json({ error: 'Forbidden' });
  const rfqId = req.params.id;
  const { unitPrice, leadTimeDays, deliveryTerms, paymentTerms, qualityGuarantee, certifications, notes, currency } = req.body;
  const finalCurrency = currency || 'USD';
  try {
    const rfq = await pool.query('SELECT * FROM rfqs WHERE id = $1', [rfqId]);
    if (rfq.rows.length === 0) return res.status(404).json({ error: 'RFQ not found' });
    const quoteNumber = `QT-${Date.now()}`;
    const totalPrice = unitPrice * rfq.rows[0].quantity;
    const result = await pool.query(`INSERT INTO quotes (quote_number, rfq_id, supplier_id, unit_price, total_price, lead_time_days, delivery_terms, payment_terms, quality_guarantee, certifications, notes, valid_until, status, submitted_at, project_id, currency) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() + INTERVAL '30 days', 'pending', NOW(), $12, $13) RETURNING *`, [quoteNumber, rfqId, req.user.id, unitPrice, totalPrice, leadTimeDays, deliveryTerms, paymentTerms, qualityGuarantee, certifications, notes, rfq.rows[0].project_id, finalCurrency]);
    io.emit('quote_submitted', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/supplier/quotes', authenticate, async (req, res) => {
  if (req.user.role !== 'supplier') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await pool.query('SELECT q.*, r.title as rfq_title FROM quotes q JOIN rfqs r ON q.rfq_id = r.id WHERE q.supplier_id = $1 ORDER BY q.submitted_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== PURCHASE ORDERS ==========
app.post('/api/quotes/:quoteId/accept', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  const quoteId = req.params.quoteId;
  try {
    const quote = await pool.query('SELECT * FROM quotes WHERE id = $1', [quoteId]);
    if (quote.rows.length === 0) return res.status(404).json({ error: 'Quote not found' });
    const rfq = await pool.query('SELECT * FROM rfqs WHERE id = $1', [quote.rows[0].rfq_id]);
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [rfq.rows[0].project_id]);
    const poNumber = await generatePONumber();
    const result = await pool.query(`INSERT INTO purchase_orders (po_number, rfq_id, quote_id, buyer_id, supplier_id, delivery_date, shipping_terms, payment_terms, subtotal, tax, shipping_cost, total_amount, items, buyer_name, buyer_phone, buyer_email, buyer_address, supplier_name, supplier_phone, supplier_email, supplier_address, status, created_at, project_id, currency) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, 'issued', NOW(), $22, $23) RETURNING *`, [poNumber, quote.rows[0].rfq_id, quoteId, req.user.id, quote.rows[0].supplier_id, rfq.rows[0].required_delivery_date, 'FOB', quote.rows[0].payment_terms, quote.rows[0].total_price, 0, 0, quote.rows[0].total_price, '[]', project.rows[0].buyer_name || '', '', '', '', quote.rows[0].supplier_name || '', '', '', '', project.rows[0].id, quote.rows[0].currency]);
    await pool.query('UPDATE quotes SET status = $1 WHERE id = $2', ['accepted', quoteId]);
    io.emit('po_created', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/pos/manual', authenticate, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Forbidden' });
  const { project_id, supplier_id, items, total_amount, delivery_date, currency } = req.body;
  try {
    const poNumber = await generatePONumber();
    const result = await pool.query(`INSERT INTO purchase_orders (po_number, project_id, buyer_id, supplier_id, items, total_amount, delivery_date, status, created_at, currency) VALUES ($1, $2, $3, $4, $5, $6, $7, 'issued', NOW(), $8) RETURNING *`, [poNumber, project_id, req.user.id, supplier_id, JSON.stringify(items), total_amount, delivery_date, currency || 'USD']);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/pos', authenticate, async (req, res) => {
  if (req.user.role === 'buyer') {
    const result = await pool.query('SELECT * FROM purchase_orders WHERE buyer_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } else if (req.user.role === 'supplier') {
    const result = await pool.query('SELECT * FROM purchase_orders WHERE supplier_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } else { res.status(403).json({ error: 'Forbidden' }); }
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

app.put('/api/pos/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  try {
    const po = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [req.params.id]);
    if (po.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'supplier' && po.rows[0].supplier_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (req.user.role === 'buyer' && po.rows[0].buyer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await pool.query('UPDATE purchase_orders SET status = $1 WHERE id = $2', [status, req.params.id]);
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
    const result = await pool.query(`UPDATE purchase_orders SET delivery_date = COALESCE($1, delivery_date), items = COALESCE($2, items), total_amount = COALESCE($3, total_amount), shipping_terms = COALESCE($4, shipping_terms), payment_terms = COALESCE($5, payment_terms), notes = COALESCE($6, notes) WHERE id = $7 RETURNING *`, [delivery_date, items ? JSON.stringify(items) : null, total_amount, shipping_terms, payment_terms, notes, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== MESSAGES ==========
app.get('/api/pos/:id/messages', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.name as sender_name 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.po_id = $1 
       ORDER BY m.created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/pos/:id/messages', authenticate, async (req, res) => {
  const { content } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO messages (po_id, sender_id, content, created_at) 
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [req.params.id, req.user.id, content]
    );
    io.emit('new_message', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== SIGNATURE ==========
app.post('/api/pos/:id/sign', authenticate, async (req, res) => {
  const { signatureData, role } = req.body;
  try {
    const po = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [req.params.id]);
    if (po.rows.length === 0) return res.status(404).json({ error: 'PO not found' });
    if (role === 'buyer' && po.rows[0].buyer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized to sign as buyer' });
    if (role === 'supplier' && po.rows[0].supplier_id !== req.user.id) return res.status(403).json({ error: 'Not authorized to sign as supplier' });
    const field = role === 'buyer' ? 'buyer_signature' : 'supplier_signature';
    const timeField = role === 'buyer' ? 'buyer_signed_at' : 'supplier_signed_at';
    await pool.query(`UPDATE purchase_orders SET ${field} = $1, ${timeField} = NOW() WHERE id = $2`, [signatureData, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== TIMELINE ==========
app.get('/api/pos/:id/timeline', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM po_timeline WHERE po_id = $1 ORDER BY created_at ASC`, [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== DOCUMENTS ==========
const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null, 'uploads/'), filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) });
const upload = multer({ storage });

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
    const result = await pool.query(`INSERT INTO documents (filename, original_name, file_path, file_size, mime_type, entity_id, entity_type, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [file.filename, file.originalname, file.path, file.size, file.mimetype, entityId, entityType, req.user.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
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

// ========== HEALTH ==========
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
