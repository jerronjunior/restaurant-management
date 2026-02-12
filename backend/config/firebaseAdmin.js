const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let firebaseApp;

const initFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not set');
  }

  const resolvedPath = path.isAbsolute(serviceAccountPath)
    ? serviceAccountPath
    : path.resolve(process.cwd(), serviceAccountPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Service account JSON not found at ${resolvedPath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });

  return firebaseApp;
};

const getDb = () => {
  if (!firebaseApp) {
    initFirebase();
  }
  return admin.firestore();
};

module.exports = {
  admin,
  initFirebase,
  getDb
};
