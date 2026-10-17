const admin = require('firebase-admin');
const path = require('path');

// Prefer a base64-encoded service account from an env var (required for
// serverless deployments like Vercel, where there's no writable local file).
// Falls back to a local firebase-service-account.json for local dev.
function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    return JSON.parse(json);
  }
  const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
  return require(serviceAccountPath);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(loadServiceAccount())
  });
  console.log('✅ [FIREBASE] Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ [FIREBASE] Firebase Admin initialization failed:', error.message);
}

module.exports = admin;
