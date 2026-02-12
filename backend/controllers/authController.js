const { validationResult } = require('express-validator');
const axios = require('axios');
const { getDb, admin } = require('../config/firebaseAdmin');

const FIREBASE_AUTH_BASE_URL = 'https://identitytoolkit.googleapis.com/v1';

const getApiKey = () => {
  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('FIREBASE_API_KEY is not set');
  }
  return apiKey;
};

const getAuthErrorMessage = (error) => {
  const message = error?.response?.data?.error?.message;
  if (!message) {
    return 'Authentication failed';
  }
  return message.replace(/_/g, ' ').toLowerCase();
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

    const signupResponse = await axios.post(
      `${FIREBASE_AUTH_BASE_URL}/accounts:signUp?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    const { localId, idToken } = signupResponse.data;
    const db = getDb();

    const userPayload = {
      name,
      email,
      role: role || 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(localId).set(userPayload);

    res.status(201).json({
      success: true,
      token: idToken,
      user: {
        id: localId,
        name: userPayload.name,
        email: userPayload.email,
        role: userPayload.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: getAuthErrorMessage(error)
    });
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

    const loginResponse = await axios.post(
      `${FIREBASE_AUTH_BASE_URL}/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    const { localId, idToken } = loginResponse.data;
    const db = getDb();

    const userDoc = await db.collection('users').doc(localId).get();
    let userData = userDoc.exists ? userDoc.data() : null;

    if (!userData) {
      userData = {
        name: email.split('@')[0],
        email,
        role: 'user',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('users').doc(localId).set(userData);
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
    res.status(500).json({
      message: 'Server error',
      error: getAuthErrorMessage(error)
    });
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

    const loginResponse = await axios.post(
      `${FIREBASE_AUTH_BASE_URL}/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    const { localId, idToken } = loginResponse.data;
    const db = getDb();

    const userDoc = await db.collection('users').doc(localId).get();
    if (!userDoc.exists) {
      return res.status(403).json({ message: 'Admin access only' });
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
    res.status(500).json({
      message: 'Server error',
      error: getAuthErrorMessage(error)
    });
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
