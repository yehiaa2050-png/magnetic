import React, { useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { signInWithPopup, signOut, User, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

interface GoogleLoginProps {
  themeColor: string;
}

export default function GoogleLogin({ themeColor }: GoogleLoginProps) {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        localStorage.setItem('google_access_token', token);
      }
    } catch (e) {
      console.error("Login failed:", e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('google_access_token');
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  if (user) {
    return (
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
      >
        <img src={user.photoURL || ''} alt="avatar" className="w-5 h-5 rounded-full" />
        <span className="text-[10px] uppercase text-white/70 mono">Logout</span>
        <LogOut className="w-3 h-3 text-white/50" />
      </button>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="flex items-center gap-2 px-3 py-1.5 border rounded-full transition-colors"
      style={{ borderColor: 'var(--theme-color-dim)', backgroundColor: 'rgba(0,0,0,0.4)', color: themeColor }}
    >
      <LogIn className="w-4 h-4" />
      <span className="text-[10px] uppercase mono">Sign in (Workspace)</span>
    </button>
  );
}
