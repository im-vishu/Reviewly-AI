import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bot, Braces, CheckCircle2, Code2, Play, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContextValue';
import { isSupabaseConfigured, SUPABASE_CONFIG_ERROR, supabase } from '../lib/supabase';
import { FormSelect, FormButton } from '../components/ui/FormInput';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../components/ui/useToast';
import { validateCodeInput, detectLanguage } from '../lib/validation';
import { LANGUAGES } from '../lib/constants';
import { analyzeReview } from '../lib/reviewApi';

export default function ReviewNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, show, dismiss } = useToast();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDetectLanguage = () => {
    const detected = detectLanguage(code);
    setLanguage(detected);
    show(`Detected: ${detected}`, 'info', 2000);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { valid, error } = validateCodeInput(code, language);
    if (!valid) newErrors.code = error ?? 'Invalid code input';
    if (!title) newErrors.title = 'Title required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user) return;
    if (!isSupabaseConfigured) {
      show(SUPABASE_CONFIG_ERROR, 'error');
      return;
    }

    setLoading(true);
    const analysis = await analyzeReview(code, language);
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: user.id,
          title,
          language,
          original_code: code,
          fixed_code: analysis.fixedCode,
          summary: analysis.summary,
          score: analysis.score,
          issue_count: analysis.issues.length,
          status: 'complete',
        },
      ])
      .select()
      .single();

    if (error) {
      show('Failed to create review', 'error');
      setLoading(false);
      return;
    }

    if (analysis.issues.length > 0) {
      const { error: issuesError } = await supabase
        .from('review_issues')
        .insert(analysis.issues.map(issue => ({ ...issue, review_id: data.id })));

      if (issuesError) {
        show('Review created, but issues could not be saved', 'error');
      }
    }

    show('Review complete!', 'success', 2000);
    navigate(`/review/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-[#080a0f] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white">
              <ArrowLeft size={16} />
              Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-gray-950">
                <Zap size={18} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">Review workbench</h1>
                <p className="mt-1 text-sm text-gray-400">Paste code, run backend analysis, and save a structured report.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
            <CheckCircle2 size={16} />
            Backend API ready
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_22rem]">
          <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1118]">
            <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-white/10 bg-[#080a0f] px-3 py-2">
                <Sparkles size={16} className="text-cyan-200" />
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ask Reviewly to inspect an auth module, API route, or PR diff..."
                  className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-gray-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Analyzing...' : 'Run review'}
                <Play size={16} />
              </button>
            </div>
            {errors.title && <p className="px-4 pt-3 text-xs text-red-300">{errors.title}</p>}

            <div className="grid min-h-[34rem] lg:grid-cols-[4rem_1fr]">
              <div className="hidden border-r border-white/10 bg-[#090c12] py-4 text-center text-xs text-gray-600 lg:block">
                {Array.from({ length: Math.max(18, code.split('\n').length) }, (_, index) => (
                  <div key={index} className="h-7">{index + 1}</div>
                ))}
              </div>
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Code2 size={16} className="text-cyan-200" />
                    Source code
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectLanguage}
                    className="rounded-md border border-white/10 px-2 py-1 text-xs text-cyan-200 hover:bg-white/[0.05]"
                  >
                    Auto-detect
                  </button>
                </div>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder={`Paste code here...\n\nExample:\nconst token = "secret";\nconsole.log(token);`}
                  className={`h-[29rem] w-full resize-none rounded-lg border bg-[#07090d] px-4 py-3 font-mono text-sm leading-7 text-gray-200 outline-none placeholder-gray-600 focus:border-cyan-300/50 ${errors.code ? 'border-red-400/60' : 'border-white/10'}`}
                />
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{code.length} / 102,400 bytes</span>
                  {errors.code && <span className="text-red-300">{errors.code}</span>}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-xl border border-white/10 bg-[#0d1118] p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Bot size={17} className="text-cyan-200" />
                Review settings
              </div>
              <FormSelect
                label="Language"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                options={LANGUAGES.map(l => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }))}
              />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { icon: ShieldCheck, label: 'Security' },
                  { icon: Braces, label: 'Quality' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <Icon size={16} className="text-cyan-200" />
                      <p className="mt-2 text-xs font-medium text-white">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-[#0d1118] p-4">
              <div className="mb-3 text-sm font-semibold text-white">Pipeline</div>
              {['Validate input', 'Call backend API', 'Save Supabase report'].map((step, index) => (
                <div key={step} className="flex items-center gap-3 border-b border-white/10 py-3 last:border-b-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] text-xs font-bold text-cyan-200">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-300">{step}</span>
                </div>
              ))}
            </section>

            <section className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-sm font-semibold text-cyan-100">Backend connected</p>
              <p className="mt-2 text-xs leading-5 text-cyan-100/70">
                The frontend uses `VITE_REVIEW_API_URL` first, then falls back to local analysis if the API is unavailable.
              </p>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <FormButton type="submit" loading={loading} className="w-full">
                Analyze
              </FormButton>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/[0.07]"
              >
                Cancel
              </Link>
            </div>
          </aside>
        </form>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
