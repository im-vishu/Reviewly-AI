import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Download, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Review as ReviewType, ReviewIssue } from '../types';
import Badge from '../components/ui/Badge';
import { useToast, ToastContainer } from '../components/ui/Toast';
import { SEVERITY_COLORS } from '../lib/constants';

export default function Review() {
  const { id } = useParams();
  const { toasts, show, dismiss } = useToast();
  const [review, setReview] = useState<ReviewType | null>(null);
  const [issues, setIssues] = useState<ReviewIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReview();
  }, [id]);

  async function fetchReview() {
    if (!id) return;

    const [reviewData, issuesData] = await Promise.all([
      supabase.from('reviews').select('*').eq('id', id).single(),
      supabase.from('review_issues').select('*').eq('review_id', id),
    ]);

    if (reviewData.data) setReview(reviewData.data as ReviewType);
    if (issuesData.data) setIssues(issuesData.data as ReviewIssue[]);
    setLoading(false);
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    show('Link copied!', 'success', 2000);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!review) return;
    const content = `# Code Review: ${review.title}

**Score:** ${review.score}/100
**Issues Found:** ${review.issue_count}
**Language:** ${review.language}
**Date:** ${new Date(review.created_at).toLocaleDateString()}

## Original Code
\`\`\`${review.language}
${review.original_code}
\`\`\`

## Issues

${issues
  .map(
    (issue, i) =>
      `### ${i + 1}. ${issue.title}
**Severity:** ${issue.severity}
**Line:** ${issue.line_start}${issue.line_end !== issue.line_start ? `-${issue.line_end}` : ''}

${issue.description}

**Suggestion:**
${issue.suggestion}
`
  )
  .join('\n')}

## Fixed Code
\`\`\`${review.language}
${review.fixed_code}
\`\`\`
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-${review.id}.md`;
    a.click();
    show('Report exported!', 'success', 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800/50 rounded w-1/3" />
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-800/50 rounded" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 md:p-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">Review not found</p>
          <Link to="/dashboard" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
          <ArrowLeft size={16} />
          Back
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{review.title}</h1>
            <p className="text-gray-400 text-sm">
              {review.language} / {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-all"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4">
            <div className="text-2xl font-bold text-cyan-400">{review.score}</div>
            <div className="text-sm text-gray-400">Quality score</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{review.issue_count}</div>
            <div className="text-sm text-gray-400">Issues found</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4">
            <Badge variant={review.status === 'complete' ? 'success' : 'info'}>
              {review.status}
            </Badge>
          </div>
        </div>

        {/* Editor & Issues */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Original code */}
          <div className="lg:col-span-2 bg-gray-900/60 border border-gray-800/60 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800/60 bg-gray-900/40">
              <h2 className="font-semibold text-white text-sm">Original Code</h2>
            </div>
            <div className="h-96">
              <Editor
                language={review.language}
                value={review.original_code}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false } }}
              />
            </div>
          </div>

          {/* Issues sidebar */}
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-800/60 bg-gray-900/40">
              <h2 className="font-semibold text-white text-sm">Issues ({issues.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-800/60">
              {issues.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No issues found</div>
              ) : (
                issues.map(issue => {
                  const color = SEVERITY_COLORS[issue.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.info;
                  return (
                    <div key={issue.id} className={`p-3 hover:bg-gray-800/30 transition-colors cursor-pointer ${color.bg}`}>
                      <div className="flex items-start gap-2 mb-1">
                        <Badge variant={color.badge}>{issue.severity}</Badge>
                        <span className="text-xs text-gray-500">L{issue.line_start}</span>
                      </div>
                      <h3 className="font-medium text-white text-xs mb-1">{issue.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{issue.description}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Fixed code */}
        {review.fixed_code && (
          <div className="mt-6 bg-gray-900/60 border border-emerald-500/20 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800/60 bg-gray-900/40">
              <h2 className="font-semibold text-emerald-400 text-sm">Fixed Code</h2>
            </div>
            <div className="h-80">
              <Editor
                language={review.language}
                value={review.fixed_code}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false } }}
              />
            </div>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
