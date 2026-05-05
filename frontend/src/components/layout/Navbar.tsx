import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Code2, LayoutDashboard, History, Users,
  Bell, ChevronLeft, ChevronRight, LogOut, User, GitBranch,
  Menu, X, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextValue';
import { supabase } from '../../lib/supabase';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Code2, label: 'New Review', path: '/review/new' },
  { icon: History, label: 'History', path: '/history' },
  { icon: GitBranch, label: 'Repositories', path: '/repos' },
  { icon: Users, label: 'Teams', path: '/teams' },
];

interface NavbarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Navbar({ collapsed, onToggle }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
      .then(({ count }) => setUnreadCount(count ?? 0));
  }, [user]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onToggle]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/review/new') return location.pathname.startsWith('/review');
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-900 border border-gray-700 rounded-lg p-2 text-gray-400 hover:text-white"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          bg-gray-950/95 backdrop-blur-xl border-r border-gray-800/60
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-60'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-gray-800/60 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div className="absolute inset-0 rounded-lg bg-cyan-400/20 blur-md" />
          </div>
          {!collapsed && (
            <span className="font-bold text-white text-sm tracking-tight">CodeLensAI</span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group relative
                  ${active
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <Icon size={18} className={`flex-shrink-0 ${active ? 'text-cyan-400' : ''}`} />
                {!collapsed && <span>{label}</span>}
                {active && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-r" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-2 border-t border-gray-800/60 space-y-1">
          <Link
            to="/notifications"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <div className="relative flex-shrink-0">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {!collapsed && <span>Notifications</span>}
          </Link>

          <Link
            to="/profile"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-6 h-6 rounded-full flex-shrink-0" alt="" />
            ) : (
              <User size={18} className="flex-shrink-0" />
            )}
            {!collapsed && (
              <span className="truncate">{profile?.full_name || user?.email?.split('@')[0] || 'Profile'}</span>
            )}
          </Link>

          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
