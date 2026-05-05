import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="text-center">
        <AlertCircle size={48} className="text-gray-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-gray-400 mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-lg transition-all"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
