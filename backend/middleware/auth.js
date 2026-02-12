const { admin, getDb } = require('../config/firebaseAdmin');

// Middleware to verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      const decoded = await admin.auth().verifyIdToken(token);
      const db = getDb();
      const userDoc = await db.collection('users').doc(decoded.uid).get();

      if (!userDoc.exists) {
        return res.status(401).json({ message: 'User not found' });
      }

      const userData = userDoc.data();
      req.user = {
        id: userDoc.id,
        uid: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      };

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Middleware to check if user is admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};
