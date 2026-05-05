import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Zap } from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_CONFIG_ERROR, supabase } from '../../lib/supabase';
import { FormInput, FormButton } from '../../components/ui/FormInput';
import { useToast, ToastContainer } from '../../components/ui/Toast';
import { validateEmail } from '../../lib/validation';
import { ERROR_MESSAGES } from '../../lib/constants';

export default function SignIn() {
  const navigate = useNavigate();
  const { toasts, show, dismiss } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!validateEmail(email)) newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!isSupabaseConfigured) {
      show(SUPABASE_CONFIG_ERROR, 'error');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      show(error.message, 'error');
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGitHub = async () => {
    if (!isSupabaseConfigured) {
      show(SUPABASE_CONFIG_ERROR, 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) show(ERROR_MESSAGES.GITHUB_AUTH, 'error');
    setLoading(false);
  };

  const handleGoogle = async () => {
    if (!isSupabaseConfigured) {
      show(SUPABASE_CONFIG_ERROR, 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) show(ERROR_MESSAGES.GITHUB_AUTH, 'error');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950">
        <img
          src="https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Code review"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/5" />
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
            <blockquote className="text-xl text-white/80 font-light leading-relaxed mb-6">
              "CodeLensAI caught 3 critical secrets in our AI-generated code that our entire team missed."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white">SC</div>
              <div>
                <div className="text-white font-medium text-sm">Sarah Chen</div>
                <div className="text-gray-400 text-xs">Senior Engineer @ Vercel</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[['98%', 'Bug reduction'], ['5x', 'Faster reviews'], ['<10s', 'PR auto-review']].map(([val, lbl]) => (
              <div key={lbl} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                <div className="text-cyan-400 font-bold text-lg">{val}</div>
                <div className="text-gray-400 text-xs mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">CodeLensAI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to your account</p>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={handleGitHub}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all"
            >
              <Github size={18} />
              Continue with GitHub
            </button>
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              label="Email address"
              error={errors.email}
            />

            <FormInput
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              label="Password"
              error={errors.password}
            />

            <FormButton type="submit" loading={loading} className="w-full">
              Sign in
            </FormButton>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Sign up free
            </Link>
          </p>

          <p className="text-center text-xs text-gray-600 mt-4">
            By signing in, you agree to our{' '}
            <a href="#" className="text-gray-500 hover:text-gray-400">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-gray-500 hover:text-gray-400">Privacy Policy</a>
          </p>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
