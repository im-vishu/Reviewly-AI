import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Github, Zap, AlertCircle, Check } from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_CONFIG_ERROR, supabase } from '../../lib/supabase';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Contains number', pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score] : 'bg-gray-700'}`} />
        ))}
      </div>
      <div className="space-y-1">
        {checks.map(c => (
          <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.pass ? 'text-emerald-400' : 'text-gray-500'}`}>
            <Check size={10} className={c.pass ? 'opacity-100' : 'opacity-30'} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError(SUPABASE_CONFIG_ERROR);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email,
      });
    }

    navigate('/dashboard');
  };

  const handleGitHub = async () => {
    if (!isSupabaseConfigured) {
      setError(SUPABASE_CONFIG_ERROR);
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  const handleGoogle = async () => {
    if (!isSupabaseConfigured) {
      setError(SUPABASE_CONFIG_ERROR);
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      {/* Left image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950">
        <img
          src="https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Team coding"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 p-12 flex flex-col justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-cyan-400/30 blur-lg" />
            </div>
            <span className="text-white font-bold text-lg">CodeLensAI</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Stop shipping<br />broken AI code.
            </h2>
            <ul className="space-y-3">
              {[
                'Instant hybrid LLM + linter analysis',
                'GitHub PR auto-review in under 10s',
                'Team workspaces with shared rules',
                'Export professional PDF reports',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-cyan-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="text-2xl font-bold text-cyan-400 mb-1">Free plan</div>
            <div className="text-gray-400 text-sm">50 reviews/month. No credit card required.</div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">CodeLensAI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-gray-400 text-sm">Start reviewing code in seconds</p>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={handleGitHub}
              className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all"
            >
              <Github size={18} />
              Continue with GitHub
            </button>
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-500 bg-[#0D0D0D] px-3">or continue with email</div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-5 text-sm text-red-400">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Alex Johnson"
                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Create a strong password"
                  className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 px-4 py-3 pr-11 rounded-xl text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 mt-2"
            >
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/auth/signin" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-gray-600 mt-4">
            By signing up, you agree to our{' '}
            <a href="#" className="text-gray-500 hover:text-gray-400">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-gray-500 hover:text-gray-400">Privacy Policy</a>.
            No spam, ever.
          </p>
        </div>
      </div>
    </div>
  );
}
