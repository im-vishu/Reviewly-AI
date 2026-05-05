import { useEffect, useState } from 'react';
import { User, Mail, Key, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || '');
  }, [profile?.full_name]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSave = async () => {
    if (!user || !isSupabaseConfigured) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

        {/* Profile card */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-16 h-16 rounded-lg" alt="" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <User size={28} className="text-cyan-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{profile?.full_name || 'User'}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-cyan-400 hover:text-cyan-300 font-medium text-sm"
            >
              Edit profile
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-medium py-2 rounded-lg text-sm"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Mail size={18} className="text-gray-400" />
            Account Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-white font-mono">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Subscription</span>
              <span className="text-cyan-400">{profile?.subscription_tier || 'free'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Joined</span>
              <span className="text-white">{new Date(profile?.created_at || '').toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Key size={18} className="text-gray-400" />
            API Keys
          </h3>
          <p className="text-gray-400 text-sm mb-4">Coming soon: Generate and manage API keys for programmatic access.</p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium py-3 rounded-lg transition-all"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );
}
