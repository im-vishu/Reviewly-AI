import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, TrendingUp, Clock, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Review } from '../types';
import Badge from '../components/ui/Badge';
import { SkeletonCard, SkeletonStat } from '../components/ui/Skeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, thisMonth: 0 });
  const statColors = {
    cyan: { box: 'bg-cyan-500/10 border-cyan-500/20', icon: 'text-cyan-400' },
    emerald: { box: 'bg-emerald-500/10 border-emerald-500/20', icon: 'text-emerald-400' },
    blue: { box: 'bg-blue-500/10 border-blue-500/20', icon: 'text-blue-400' },
  };

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
  }, [user]);

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setReviews(data as Review[]);
      const avgScore = data.length ? Math.round(data.reduce((a, r) => a + r.score, 0) / data.length) : 0;
      setStats({
        total: data.length,
        avgScore,
        thisMonth: data.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length,
      });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Zap size={24} className="text-cyan-400" />
            Dashboard
          </h1>
          <p className="text-gray-400">Manage your code reviews and track improvements</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {loading ? (
            <>
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
            </>
          ) : (
            [
              { label: 'Total Reviews', value: stats.total, icon: FileText, color: 'cyan' },
              { label: 'Avg Score', value: `${stats.avgScore}/100`, icon: TrendingUp, color: 'emerald' },
              { label: 'This Month', value: stats.thisMonth, icon: Clock, color: 'blue' },
            ].map(stat => {
              const Icon = stat.icon;
              const color = statColors[stat.color as keyof typeof statColors];
              return (
                <div key={stat.label} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6 hover:border-gray-700/80 transition-all">
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-4 ${color.box}`}>
                    <Icon size={20} className={color.icon} />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </div>
              );
            })
          )}
        </div>

        {/* New Review CTA */}
        <Link
          to="/review/new"
          className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40 hover:-translate-y-0.5 mb-8"
        >
          <Plus size={18} />
          New Review
        </Link>

        {/* Recent Reviews */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800/60">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText size={18} className="text-cyan-400" />
              Recent Reviews
            </h2>
          </div>

          {loading ? (
            <div className="divide-y divide-gray-800/60">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No reviews yet. Create your first one to get started!</p>
              <Link to="/review/new" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                Create your first review &gt;
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/60">
              {reviews.map(review => (
                <Link
                  key={review.id}
                  to={`/review/${review.id}`}
                  className="block px-6 py-4 hover:bg-gray-800/30 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white group-hover:text-cyan-400 truncate transition-colors">
                        {review.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span className="font-mono text-xs">{review.language}</span>
                        <span>/</span>
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
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
        </div>
      </div>
    </div>
  );
}
