import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Landing from './pages/Landing';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import History from './pages/History';
import ReviewNew from './pages/ReviewNew';
import Review from './pages/Review';
import NotFound from './pages/NotFound';
import { Notifications, Repositories, Rules, Settings, Teams } from './pages/WorkspacePages';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  if (!user) return <Navigate to="/auth/signin" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/auth/signin" element={user ? <Navigate to="/dashboard" /> : <SignIn />} />
        <Route path="/auth/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/review/new" element={<ReviewNew />} />
          <Route path="/review/:id" element={<Review />} />
          <Route path="/repos" element={<Repositories />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
