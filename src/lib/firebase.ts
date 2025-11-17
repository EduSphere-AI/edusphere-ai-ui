// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// RUN Debug mode: Log environment variables (REMOVE THIS AFTER TESTING)
// console.log('🔍 Firebase Environment Check:', {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Loaded' : '❌ Missing',
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Loaded' : '❌ Missing',
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Loaded' : '❌ Missing',
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Loaded' : '❌ Missing',
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Loaded' : '❌ Missing',
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Loaded' : '❌ Missing',
// });

// Validate that all required environment variables are present
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
    const errorMessage = `
    ❌ Firebase Configuration Error

    Missing environment variables in .env.local:
    ${missingVars.map((v) => `  - ${v}`).join('\n')}

    📝 To fix this:
    1. Create a file named .env.local in your project root
    2. Add these variables (replace with your actual Firebase values):

    ${Object.keys(requiredEnvVars)
        .map((key) => `${key}=your_value_here`)
        .join('\n')}

    3. Get your values from: https://console.firebase.google.com
      → Project Settings → General → Your apps → Web app

    4. Restart your dev server: npm run dev
      `;

    throw new Error(errorMessage);
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Initialize Firebase (only once)
const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Log successful initialization
console.log('✅ Firebase initialized successfully');

export default app;
