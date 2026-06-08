const express = require('express');
const router = express.Router();

// Import controllers
const { register, login, getMe, getAllUsers } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Log when routes file is loaded
console.log('✅ Auth routes loaded');

// Public routes - make sure these are defined
router.post('/register', (req, res, next) => {
  console.log('👉 Register route hit');
  next();
}, register);

router.post('/login', (req, res, next) => {
  console.log('👉 Login route hit');
  next();
}, login);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.get('/users', getAllUsers);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth router is working!' });
});

module.exports = router;