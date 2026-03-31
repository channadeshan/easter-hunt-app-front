import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ADMIN_API, PARTI_API } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import EmojiPicker from '../components/EmojiPicker';
import { PARTICIPANT_AVATARS, defaultAsset } from '../config/emojiAssets';

type Mode = 'choose' | 'admin' | 'player';

export default function LandingPage() {
  const { checkStatus } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('choose');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  // selectedAvatarUrl holds the full image URL sent to the backend
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(
    defaultAsset(PARTICIPANT_AVATARS).url
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${ADMIN_API}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || 'Invalid password');
        return;
      }
      await checkStatus();
      navigate('/admin', { replace: true });
    } catch {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${PARTI_API}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        // emojiUrl is the full CDN image URL from emojiAssets.ts
        body: JSON.stringify({ username: username.trim(), emojiUrl: selectedAvatarUrl }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || 'Could not join the hunt');
        return;
      }
      await checkStatus();
      navigate('/play', { replace: true });
    } catch {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 relative">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ff6b6b 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #cc5de8 0%, transparent 70%)' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ffd43b 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-block mb-4 animate-float">
            <img src={defaultAsset(PARTICIPANT_AVATARS).url} alt="Egg Hunt" className="w-20 h-20 mx-auto" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white tracking-wide">Egg Hunt</h1>
          <p className="text-gray-500 font-body text-sm mt-2">Campus Easter Egg Hunt &middot; Live</p>
        </div>

        {/* Mode chooser */}
        {mode === 'choose' && (
          <div className="space-y-3 animate-slide-up stagger-1">
            <button onClick={() => setMode('player')}
              className="w-full glass rounded-2xl p-5 text-left border-hunt-border hover:border-hunt-canary/50 transition-all duration-200 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-hunt-canary/10 flex items-center justify-center p-2 group-hover:scale-110 transition-transform overflow-hidden">
                  <img src={PARTICIPANT_AVATARS[0].url} alt="Player" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="font-display font-semibold text-white text-base">Join the Hunt</p>
                  <p className="text-xs text-gray-500 font-body mt-0.5">I'm a participant</p>
                </div>
                <span className="ml-auto text-gray-600 group-hover:text-hunt-canary transition-colors">→</span>
              </div>
            </button>

            <button onClick={() => setMode('admin')}
              className="w-full glass rounded-2xl p-5 text-left border-hunt-border hover:border-hunt-lavender/50 transition-all duration-200 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-hunt-lavender/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🔐</div>
                <div>
                  <p className="font-display font-semibold text-white text-base">Organizer Access</p>
                  <p className="text-xs text-gray-500 font-body mt-0.5">Admin dashboard</p>
                </div>
                <span className="ml-auto text-gray-600 group-hover:text-hunt-lavender transition-colors">→</span>
              </div>
            </button>
          </div>
        )}

        {/* Admin Login */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="animate-slide-up">
            <div className="glass rounded-2xl p-5 border-hunt-border">
              <div className="flex items-center gap-3 mb-5">
                <button type="button" onClick={() => { setMode('choose'); setError(''); }}
                  className="text-gray-500 hover:text-white transition-colors text-lg">←</button>
                <h2 className="font-display font-semibold text-white text-lg">Organizer Login</h2>
              </div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2 font-body">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password" autoFocus
                className="w-full bg-hunt-bg border border-hunt-border rounded-xl px-4 py-3 text-white font-body text-sm placeholder-gray-600 focus:outline-none focus:border-hunt-lavender transition-colors" />
              {error && <p className="text-hunt-coral text-xs mt-2 font-body">{error}</p>}
              <button type="submit" disabled={loading || !password}
                className="w-full mt-4 bg-hunt-lavender hover:bg-hunt-lavender/80 disabled:opacity-50 text-white font-display font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                {loading ? <Spinner size="sm" color="border-white" /> : 'Access Dashboard →'}
              </button>
            </div>
          </form>
        )}

        {/* Player Join */}
        {mode === 'player' && (
          <form onSubmit={handleJoin} className="animate-slide-up">
            <div className="glass rounded-2xl p-5 border-hunt-border">
              <div className="flex items-center gap-3 mb-5">
                <button type="button" onClick={() => { setMode('choose'); setError(''); }}
                  className="text-gray-500 hover:text-white transition-colors text-lg">←</button>
                <h2 className="font-display font-semibold text-white text-lg">Join the Hunt</h2>
              </div>

              {/* Selected avatar preview */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-hunt-canary/10 border-2 border-hunt-canary p-2">
                  <img src={selectedAvatarUrl} alt="Selected avatar" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Avatar grid — all URLs from PARTICIPANT_AVATARS in emojiAssets.ts */}
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2 font-body">Choose Your Avatar</label>
              <EmojiPicker
                pool={PARTICIPANT_AVATARS}
                selected={selectedAvatarUrl}
                onChange={setSelectedAvatarUrl}
              />

              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2 mt-4 font-body">Your Name</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username" maxLength={20}
                className="w-full bg-hunt-bg border border-hunt-border rounded-xl px-4 py-3 text-white font-body text-sm placeholder-gray-600 focus:outline-none focus:border-hunt-canary transition-colors" />
              {error && <p className="text-hunt-coral text-xs mt-2 font-body">{error}</p>}
              <button type="submit" disabled={loading || !username.trim()}
                className="w-full mt-4 bg-hunt-canary hover:bg-hunt-canary/80 disabled:opacity-50 text-hunt-bg font-display font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                {loading ? <Spinner size="sm" color="border-hunt-bg" /> : (
                  <><img src={selectedAvatarUrl} alt="" className="w-5 h-5 object-contain" /> Start Hunting →</>
                )}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-700 text-xs mt-6 font-body">
          Easter Egg Hunt &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
