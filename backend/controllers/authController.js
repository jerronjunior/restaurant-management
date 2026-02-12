const { validationResult } = require('express-validator');
const axios = require('axios');
const { admin, getDb } = require('../config/firebaseAdmin');

const signUpUrl = (apiKey) => `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
const signInUrl = (apiKey) => `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

const getApiKey = () => {
  if (!process.env.FIREBASE_API_KEY) {
    throw new Error('FIREBASE_API_KEY is not set');
  }
  return process.env.FIREBASE_API_KEY;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;
    const apiKey = getApiKey();

    const response = await axios.post(signUpUrl(apiKey), {
      email,
      password,
      returnSecureToken: true
    });

    const { localId, idToken } = response.data;
    const db = getDb();

    await db.collection('users').doc(localId).set({
      name,
      email,
      role: role || 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      success: true,
      token: idToken,
      user: {
        id: localId,
        name,
        email,
        role: role || 'user'
      }
    });
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    res.status(500).json({ message: 'Server error', error: message });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const apiKey = getApiKey();
    const response = await axios.post(signInUrl(apiKey), {
      email,
      password,
      returnSecureToken: true
    });

    const { localId, idToken } = response.data;
    const db = getDb();
    const userDoc = await db.collection('users').doc(localId).get();

    if (!userDoc.exists) {
      return res.status(401).json({ message: 'User profile not found' });
    }

    const userData = userDoc.data();

    res.json({
      success: true,
      token: idToken,
      user: {
        id: localId,
        name: userData.name,
        email: userData.email,
        role: userData.role
      }
    });
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    res.status(500).json({ message: 'Server error', error: message });
  }
};

// @route   POST /api/auth/admin/login
// @desc    Login admin user
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const apiKey = getApiKey();
    const response = await axios.post(signInUrl(apiKey), {
      email,
      password,
      returnSecureToken: true
    });

    const { localId, idToken } = response.data;
    const db = getDb();
    const userDoc = await db.collection('users').doc(localId).get();

    if (!userDoc.exists) {
      return res.status(401).json({ message: 'User profile not found' });
    }

    const userData = userDoc.data();
    if (userData.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }

    res.json({
      success: true,
      token: idToken,
      user: {
        id: localId,
        name: userData.name,
        email: userData.email,
        role: userData.role
      }
    });
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    res.status(500).json({ message: 'Server error', error: message });
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const db = getDb();
    const userDoc = await db.collection('users').doc(req.user.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userDoc.data();
    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
