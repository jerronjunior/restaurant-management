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

const buildAuthErrorResponse = (error) => {
  const firebaseMessage = error?.response?.data?.error?.message;
  const isFirebaseError = !!firebaseMessage;
  const isConfigError = typeof error?.message === 'string' && error.message.includes('FIREBASE_');

  if (isFirebaseError) {
    return {
      status: 400,
      message: getAuthErrorMessage(error)
    };
  }

  if (isConfigError) {
    return {
      status: 500,
      message: error.message
    };
  }

  return {
    status: 500,
    message: 'Server error'
  };
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
    const db = getDb();

    // Prevent admin registration through public endpoint
    // Only allow 'user' role registration
    const userRole = role === 'admin' ? 'user' : 'user';
    
    // Check if trying to register as admin (blocked)
    if (role === 'admin') {
      // Check if admin already exists
      const adminSnapshot = await db.collection('users').where('role', '==', 'admin').limit(1).get();
      
      if (!adminSnapshot.empty) {
        return res.status(403).json({
          message: 'Admin account already exists. Only one admin is allowed.'
        });
      }
    }

    const signupResponse = await axios.post(
      `${FIREBASE_AUTH_BASE_URL}/accounts:signUp?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    const { localId, idToken } = signupResponse.data;

    const userPayload = {
      name,
      email,
      role: userRole,
      blocked: false,
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
    const authError = buildAuthErrorResponse(error);
    res.status(authError.status).json({
      message: authError.message
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
        blocked: false,
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
    const authError = buildAuthErrorResponse(error);
    res.status(authError.status).json({
      message: authError.message
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
    const authError = buildAuthErrorResponse(error);
    res.status(authError.status).json({
      message: authError.message
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

// @route   POST /api/auth/setup-admin
// @desc    Create first admin account (one-time setup)
// @access  Public (but checks if admin exists)
exports.setupAdmin = async (req, res) => {
  try {
    const { name, email, password, setupKey } = req.body;
    
    // Require a setup key for security
    const requiredSetupKey = process.env.ADMIN_SETUP_KEY || 'admin-setup-2024';
    
    if (setupKey !== requiredSetupKey) {
      return res.status(403).json({ message: 'Invalid setup key' });
    }

    const db = getDb();
    
    // Check if admin already exists
    const adminSnapshot = await db.collection('users').where('role', '==', 'admin').limit(1).get();
    
    if (!adminSnapshot.empty) {
      return res.status(403).json({
        message: 'Admin account already exists. Only one admin is allowed.'
      });
    }

    const apiKey = getApiKey();
    
    // Create admin account in Firebase Auth
    const signupResponse = await axios.post(
      `${FIREBASE_AUTH_BASE_URL}/accounts:signUp?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    const { localId, idToken } = signupResponse.data;

    // Create admin user document
    const adminPayload = {
      name,
      email,
      role: 'admin',
      blocked: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(localId).set(adminPayload);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token: idToken,
      user: {
        id: localId,
        name: adminPayload.name,
        email: adminPayload.email,
        role: adminPayload.role
      }
    });
  } catch (error) {
    const authError = buildAuthErrorResponse(error);
    res.status(authError.status).json({
      message: authError.message
    });
  }
};
