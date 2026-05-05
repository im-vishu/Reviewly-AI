import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  GitBranch,
  Plus,
  Sparkles,
  TerminalSquare,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContextValue';
import { supabase } from '../lib/supabase';
import { Review } from '../types';
import Badge from '../components/ui/Badge';
import { SkeletonCard, SkeletonStat } from '../components/ui/Skeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, thisMonth: 0 });

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setReviews(data as Review[]);
      const avgScore = data.length ? Math.round(data.reduce((a, r) => a + r.score, 0) / data.length) : 0;
      const now = new Date();
      setStats({
        total: data.length,
        avgScore,
        thisMonth: data.filter(r => {
          const createdAt = new Date(r.created_at);
          return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
        }).length,
      });
    }
    setLoading(false);
  }, [user]);

  const launchpadItems = useMemo(() => [
    { icon: Code2, label: 'Paste code', detail: 'Run a focused review', to: '/review/new', accent: 'text-cyan-300 bg-cyan-500/10 border-cyan-400/20' },
    { icon: GitBranch, label: 'Connect repo', detail: 'Prepare PR checks', to: '/repos', accent: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20' },
    { icon: TerminalSquare, label: 'View history', detail: 'Compare recent runs', to: '/history', accent: 'text-amber-300 bg-amber-500/10 border-amber-400/20' },
  ], []);

  useEffect(() => {
    if (!user) return;
    fetchReviews();

    const subscription = supabase
      .channel(`reviews:user_id:eq.${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `user_id=eq.${user.id}` }, () => {
        fetchReviews();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchReviews, user]);

  return (
    <div className="min-h-screen bg-[#080a0f] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
              <Sparkles size={14} />
              AI review workspace
            </div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">What should Reviewly inspect next?</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Launch a review, connect repositories, and watch fixes move from idea to checked code.
            </p>
          </div>

          <Link
            to="/review/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-gray-950 shadow-lg shadow-cyan-500/10 transition-all hover:-translate-y-0.5 hover:bg-cyan-100"
          >
            <Plus size={18} />
            New Review
          </Link>
        </div>

        <section className="overflow-hidden rounded-xl border border-white/10 bg-gray-950">
          <div className="grid gap-0 lg:grid-cols-[1.45fr_0.9fr]">
            <div className="border-b border-white/10 p-5 md:p-7 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-300">
                <Zap size={18} className="text-cyan-300" />
                Ask for a review
              </div>
              <Link
                to="/review/new"
                className="group block rounded-lg border border-white/10 bg-[#0e1118] p-4 transition-all hover:border-cyan-300/40 hover:bg-[#121722]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Prompt</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Analyze this code for security, reliability, and production readiness.
                    </p>
                  </div>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-400 text-gray-950 transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </Link>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {launchpadItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg border ${item.accent}`}>
                        <Icon size={18} />
                      </div>
                      <div className="text-sm font-semibold text-white">{item.label}</div>
                      <div className="mt-1 text-xs text-gray-500">{item.detail}</div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="p-5 md:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Review pipeline</p>
                  <p className="text-xs text-gray-500">Backend API + Supabase persistence</p>
                </div>
                <Badge variant="success">Live</Badge>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Submit code', icon: Code2 },
                  { label: 'Backend analysis', icon: Sparkles },
                  { label: 'Save report', icon: CheckCircle2 },
                ].map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-cyan-200">
                        <Icon size={17} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{step.label}</div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300" style={{ width: `${90 - index * 14}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {loading ? (
            <>
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
            </>
          ) : (
            [
              { label: 'Total Reviews', value: stats.total, icon: FileText, color: 'text-cyan-300 bg-cyan-500/10 border-cyan-400/20' },
              { label: 'Avg Score', value: `${stats.avgScore}/100`, icon: TrendingUp, color: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20' },
              { label: 'This Month', value: stats.thisMonth, icon: Clock, color: 'text-amber-300 bg-amber-500/10 border-amber-400/20' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-gray-950 p-5 transition-all hover:border-white/20">
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg border ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })
          )}
        </div>

        <section className="overflow-hidden rounded-xl border border-white/10 bg-gray-950">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <FileText size={18} className="text-cyan-300" />
              Recent Reviews
            </h2>
            <Link to="/history" className="text-sm font-medium text-cyan-200 hover:text-white">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-white/10">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-cyan-200">
                <Sparkles size={22} />
              </div>
              <p className="mb-4 text-gray-400">No reviews yet. Start with a pasted snippet or connect a repository.</p>
              <Link to="/review/new" className="text-sm font-medium text-cyan-200 hover:text-white">
                Create your first review
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {reviews.map(review => (
                <Link
                  key={review.id}
                  to={`/review/${review.id}`}
                  className="group block px-5 py-4 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-medium text-white transition-colors group-hover:text-cyan-200">
                        {review.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-mono text-xs">{review.language}</span>
                        <span>/</span>
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{review.score}</div>
                        <div className="text-xs text-gray-500">{review.issue_count} issues</div>
                      </div>
                      <Badge variant={review.status === 'complete' ? 'success' : review.status === 'error' ? 'error' : 'info'}>
                        {review.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
