import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Add Workspace scopes for the APIs requested
googleAuthProvider.addScope('https://www.googleapis.com/auth/drive');
googleAuthProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleAuthProvider.addScope('https://mail.google.com/');
googleAuthProvider.addScope('https://www.googleapis.com/auth/calendar');
googleAuthProvider.addScope('https://www.googleapis.com/auth/documents');
googleAuthProvider.addScope('https://www.googleapis.com/auth/forms.body');
googleAuthProvider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/meetings.space.created');
googleAuthProvider.addScope('https://www.googleapis.com/auth/meetings.space.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/contacts');
