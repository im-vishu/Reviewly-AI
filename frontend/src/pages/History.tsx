import { ChangeEvent, useCallback, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextValue';
import { supabase } from '../lib/supabase';
import { Review } from '../types';
import Badge from '../components/ui/Badge';
import { ArrowLeft, Calendar, Search } from 'lucide-react';
import { FormInput } from '../components/ui/FormInput';

export default function History() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchReviews = useCallback(async (offset: number) => {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const orderBy = sortBy === 'date' ? 'created_at' : 'score';
    query = query.order(orderBy, { ascending: sortBy === 'date' });

    const { data, error } = await query.range(offset, offset + 19);

    if (!error && data) {
      if (offset === 0) setReviews(data as Review[]);
      else setReviews(prev => [...prev, ...(data as Review[])]);
      setHasMore((data as Review[]).length === 20);
    }
    setLoading(false);
  }, [search, sortBy, user]);

  useEffect(() => {
    if (!user) return;
    setReviews([]);
    fetchReviews(0);
  }, [fetchReviews, user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchReviews(reviews.length);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchReviews, reviews.length, hasMore, loading]);

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm">
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Review History</h1>
          <p className="text-gray-400 text-sm mt-1">{reviews.length} reviews / Sorted by {sortBy}</p>
        </div>

        {/* Search & Filter */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <FormInput
            icon={<Search size={16} />}
            placeholder="Search reviews..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            value={sortBy}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'date' | 'score')}
            className="bg-gray-900 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-cyan-500/60 text-sm"
          >
            <option value="date">Sort by date</option>
            <option value="score">Sort by score</option>
          </select>
        </div>

        {/* Reviews list */}
        {reviews.length === 0 && !loading ? (
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-12 text-center">
            <Calendar size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">{search ? 'No reviews match your search' : 'No reviews yet'}</p>
          </div>
        ) : (
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-800/60">
              {reviews.map(review => (
                <Link
                  key={review.id}
                  to={`/review/${review.id}`}
                  className="block px-6 py-4 hover:bg-gray-800/30 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white group-hover:text-cyan-400 truncate transition-colors">{review.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="font-mono">{review.language}</span>
                        <span>/</span>
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{review.score}</div>
                        <div className="text-xs text-gray-500">{review.issue_count} issues</div>
                      </div>
                      <Badge variant={review.status === 'complete' ? 'success' : 'warning'}>
                        {review.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div ref={observerTarget} className="p-4 text-center text-gray-400 text-sm">
                {loading ? 'Loading more...' : 'Scroll for more'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
