import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured, SUPABASE_CONFIG_ERROR, supabase } from '../lib/supabase';
import { FormSelect, FormButton } from '../components/ui/FormInput';
import { useToast, ToastContainer } from '../components/ui/Toast';
import { validateCodeInput, detectLanguage } from '../lib/validation';
import { LANGUAGES } from '../lib/constants';
import { analyzeCode } from '../lib/analyzer';

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
    const analysis = analyzeCode(code);
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
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm">
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2 mb-2">
            <Zap size={24} className="text-cyan-400" />
            New Review
          </h1>
          <p className="text-gray-400">Paste your code for instant hybrid LLM + linter analysis</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Review title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., User authentication module"
              className={`w-full bg-gray-800 border ${errors.title ? 'border-red-500/60' : 'border-gray-700'} text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all`}
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
          </div>

          {/* Code & Language */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="md:col-span-3 bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">Code</label>
                <button
                  type="button"
                  onClick={handleDetectLanguage}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Auto-detect
                </button>
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className={`w-full bg-gray-800 border ${errors.code ? 'border-red-500/60' : 'border-gray-700'} text-white placeholder-gray-500 px-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none h-80`}
              />
              {errors.code && <p className="text-xs text-red-400 mt-2">{errors.code}</p>}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{code.length} / 102,400 bytes</span>
              </div>
            </div>

            <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
              <FormSelect
                label="Language"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                options={LANGUAGES.map(l => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }))}
              />

              <div className="mt-6">
                <div className="text-sm font-medium text-gray-300 mb-3">Quick tips</div>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li>Supports 15+ languages</li>
                  <li>Max 100KB code</li>
                  <li>50 reviews/month free</li>
                  <li>Powered by built-in rules</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <FormButton type="submit" loading={loading} className="flex-1">
              Analyze Now
            </FormButton>
            <Link
              to="/dashboard"
              className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium text-sm transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
