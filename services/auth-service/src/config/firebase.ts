import admin from 'firebase-admin';
import { logger } from '@hrm/common';

let firebaseApp: admin.app.App;

export const initializeFirebase = (): void => {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
    }

    const serviceAccountJson = JSON.parse(serviceAccount);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    });

    logger.info('Firebase Admin initialized successfully');
  } catch (error) {
    logger.error('Error initializing Firebase Admin:', error);
    throw error;
  }
};

export const getFirebaseAdmin = (): admin.app.App => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin not initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
};

export const verifyIdToken = async (idToken: string): Promise<admin.auth.DecodedIdToken> => {
  const admin = getFirebaseAdmin();
  return await admin.auth().verifyIdToken(idToken);
};

export const getUserByUid = async (uid: string): Promise<admin.auth.UserRecord> => {
  const admin = getFirebaseAdmin();
  return await admin.auth().getUser(uid);
};

export const setCustomUserClaims = async (
  uid: string,
  customClaims: Record<string, any>
): Promise<void> => {
  const admin = getFirebaseAdmin();
  await admin.auth().setCustomUserClaims(uid, customClaims);
};

