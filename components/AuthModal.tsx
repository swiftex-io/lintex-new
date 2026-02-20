import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useExchangeStore } from '../store';
import Logo from './Logo';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; type?: 'db' | 'auth' | 'success' } | null>(null);
  
  const { initialize, enterAsGuest } = useExchangeStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError({ message: "Passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
      } else {
        const { error: signUpErr, data } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              nickname: nickname || email.split('@')[0],
            }
          }
        });
        
        if (signUpErr) throw signUpErr;

        if (data.user && !data.session) {
          setError({
            message: "Success! But check your email for confirmation (if enabled in Supabase).",
            type: 'success'
          });
          setLoading(false);
          setIsLogin(true);
          return;
        }
      }
      
      await initialize();
      onClose();
    } catch (err: any) {
      console.error("Auth Error:", err);
      let msg = err.message || "An unexpected error occurred.";
      let type: 'db' | 'auth' = 'auth';

      if (err.status === 500 || msg.includes('profiles')) {
        type = 'db';
        msg = "SQL ERROR: Column 'nickname' is missing in your 'profiles' table. Please run the SQL fix below in your Supabase SQL Editor.";
      }

      setError({ message: msg, type });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/5 rounded-[20px] w-full max-w-md p-10 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="text-center mb-10">
          <Logo className="h-10 mx-auto mb-6 text-white" />
          <h2 className="text-3xl font-black mb-2 tracking-tighter">{isLogin ? 'Lintex Log In' : 'Create Account'}</h2>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className={`p-5 rounded-2xl border text-[10px] font-black uppercase tracking-wider leading-relaxed space-y-3 ${
              error.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
              error.type === 'db' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
              'bg-red-500/10 border-red-500/20 text-red-500'
            }`}>
              <p>{error.message}</p>
              {error.type === 'db' && (
                <div className="mt-4 p-3 bg-black/40 rounded-xl border border-white/5 select-all font-mono normal-case text-gray-300">
                  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname TEXT;
                </div>
              )}
            </div>
          )}

          {!isLogin && (
            <input 
              type="text" 
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-zinc-800 border-2 border-transparent rounded-2xl p-4 focus:outline-none focus:border-white transition-all font-bold text-sm text-white"
              placeholder="Your Nickname"
            />
          )}

          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-800 border-2 border-transparent rounded-2xl p-4 focus:outline-none focus:border-white transition-all font-bold text-sm text-white"
            placeholder="Email"
          />

          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 border-2 border-transparent rounded-2xl p-4 focus:outline-none focus:border-white transition-all font-bold text-sm text-white"
            placeholder="Password"
          />

          {!isLogin && (
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-zinc-800 border-2 border-transparent rounded-2xl p-4 focus:outline-none focus:border-white transition-all font-bold text-sm text-white"
              placeholder="Confirm Password"
            />
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-white text-black font-black rounded-2xl text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 mt-4"
          >
            {loading ? 'Working...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[11px] font-bold text-gray-500 hover:text-white transition-colors tracking-tight block w-full text-center">
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
          </button>
          <button onClick={() => enterAsGuest().then(onClose)} className="w-full py-4 bg-zinc-800 text-gray-400 font-bold rounded-2xl text-[11px] hover:bg-zinc-700 transition-all border border-white/5 tracking-tight">
            ⚡ Bypass to Guest Mode (Safe)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;