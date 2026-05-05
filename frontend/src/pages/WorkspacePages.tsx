import { ReactNode, useEffect, useState } from 'react';
import { Bell, BookOpen, GitBranch, LucideIcon, Settings as SettingsIcon, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RULE_PRESETS } from '../lib/constants';
import { ConnectedRepo, CustomRule, Notification, Team } from '../types';
import { useAuth } from '../contexts/AuthContextValue';
import Badge from '../components/ui/Badge';

function PageShell({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Icon size={24} className="text-cyan-400" />
            {title}
          </h1>
          <p className="text-gray-400">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-10 text-center text-gray-400">
      {message}
    </div>
  );
}

export function Repositories() {
  const { user } = useAuth();
  const [repos, setRepos] = useState<ConnectedRepo[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('connected_repos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRepos((data as ConnectedRepo[]) ?? []));
  }, [user]);

  return (
    <PageShell icon={GitBranch} title="Repositories" description="Connected GitHub repositories for automated pull request review.">
      {repos.length === 0 ? (
        <EmptyState message="No repositories connected yet. GitHub app installation is the next backend integration to add." />
      ) : (
        <div className="grid gap-3">
          {repos.map(repo => (
            <a key={repo.id} href={repo.repo_url} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 hover:border-cyan-500/30 transition-colors">
              <div className="font-medium text-white">{repo.repo_full_name}</div>
              <div className="text-sm text-gray-500 mt-1">{repo.auto_review ? 'Auto-review enabled' : 'Auto-review disabled'}</div>
            </a>
          ))}
        </div>
      )}
    </PageShell>
  );
}

export function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setTeams((data as Team[]) ?? []));
  }, [user]);

  return (
    <PageShell icon={Users} title="Teams" description="Workspaces for shared reviews, rules, and team collaboration.">
      {teams.length === 0 ? (
        <EmptyState message="No teams found. Add team creation and invitations when you are ready for collaboration workflows." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {teams.map(team => (
            <div key={team.id} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-5">
              <div className="font-semibold text-white">{team.name}</div>
              <div className="text-sm text-gray-500 mt-1">{team.description || team.slug}</div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

export function Rules() {
  const { user } = useAuth();
  const [rules, setRules] = useState<CustomRule[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('custom_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRules((data as CustomRule[]) ?? []));
  }, [user]);

  return (
    <PageShell icon={BookOpen} title="Rules" description="Review rules used by the built-in analyzer and future AI checks.">
      <div className="grid gap-3">
        {[...RULE_PRESETS, ...rules].map(rule => (
          <div key={rule.name} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-white">{rule.name}</div>
                <div className="text-xs text-gray-500 mt-1 font-mono">{rule.pattern}</div>
              </div>
              <Badge variant={rule.severity === 'critical' ? 'critical' : rule.severity === 'error' ? 'error' : rule.severity === 'warning' ? 'warning' : 'info'}>
                {rule.severity}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function Settings() {
  return (
    <PageShell icon={SettingsIcon} title="Settings" description="Default review preferences and account-level controls.">
      <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-1">Model</div>
            <div className="text-white">Built-in rules now, AI provider next</div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Auto-fix</div>
            <div className="text-white">Enabled for safe console cleanup</div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotifications((data as Notification[]) ?? []));
  }, [user]);

  return (
    <PageShell icon={Bell} title="Notifications" description="Review status, repository activity, and account updates.">
      {notifications.length === 0 ? (
        <EmptyState message="No notifications yet." />
      ) : (
        <div className="divide-y divide-gray-800/60 bg-gray-900/60 border border-gray-800/60 rounded-xl overflow-hidden">
          {notifications.map(notification => (
            <div key={notification.id} className="p-4">
              <div className="font-medium text-white">{notification.title}</div>
              <div className="text-sm text-gray-400 mt-1">{notification.message}</div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
