const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Temporary storage
const users = [];

console.log('✅ Auth controller loaded');

// Simple register function
const register = async (req, res) => {
  console.log('📝 Register function called');
  console.log('Request body:', req.body);
  
  try {
    const { email, password, name, role, companyName } = req.body;

    // Basic validation
    if (!email || !password || !name || !role) {
      console.log('❌ Missing fields');
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required',
        received: { email, name, role, hasPassword: !!password }
      });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(409).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      email,
      password: hashedPassword,
      name,
      role,
      companyName: companyName || '',
      createdAt: new Date()
    };

    users.push(newUser);
    console.log('✅ User created:', { email, role });
    console.log(`📊 Total users: ${users.length}`);

    // Create token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'axo_networks_super_secret_key_2026',
      { expiresIn: '7d' }
    );

    // Return response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        companyName: newUser.companyName
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Simple login function
const login = async (req, res) => {
  console.log('🔐 Login function called');
  console.log('Request body:', req.body);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'axo_networks_super_secret_key_2026',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful:', email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyName: user.companyName
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyName: user.companyName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllUsers = async (req, res) => {
  const usersList = users.map(({ password, ...user }) => user);
  res.json({ users: usersList, count: users.length });
};

module.exports = { register, login, getMe, getAllUsers };