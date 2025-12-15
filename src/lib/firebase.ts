// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// 🔍 Environment variable check (optional debug)
const requiredEnvVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    throw new Error(`
    ❌ Firebase Configuration Error

      Missing environment variables in .env.local:
      ${missingVars.map((v) => `  - ${v}`).join('\n')}

      Please add them and restart your dev server.
    `);
}

// Firebase config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Initialize Firebase app
const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);

// 🔹 Helper: Create user profile in Firestore
export async function createUserProfile(user: any, extraData: any = {}) {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        try {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: extraData.username || user.displayName || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Do NOT store password - Firebase Auth handles this securely
            });
            console.log('✅ User profile created in Firestore:', user.uid);
        } catch (error) {
            console.error('❌ Error creating user profile:', error);
            throw error;
        }
    } else {
        console.log('ℹ️ User profile already exists:', user.uid);
    }
}

// 🔹 Helper: Fetch user profile
export async function getUserProfile(uid: string) {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data();
    }
    return null;
}

console.log('✅ Firebase + Firestore initialized successfully');

export default app;
