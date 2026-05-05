import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  GitBranch,
  Play,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Zap,
} from 'lucide-react';

const sampleCode = [
  'async function createSession(user) {',
  '  const token = "sk_live_123";',
  '  console.log("creating session", user.id);',
  '  const result = await fetch(`/api/session/${user.id}`);',
  '  eval(await result.text());',
  '  return result.json();',
  '}',
];

const findings = [
  { label: 'Secret exposed', severity: 'critical', line: 2 },
  { label: 'Production logging', severity: 'warning', line: 3 },
  { label: 'Unsafe eval', severity: 'critical', line: 5 },
];

const metrics = [
  { value: '97', label: 'target score' },
  { value: '3', label: 'issues found' },
  { value: '8s', label: 'analysis time' },
];

const workflows = [
  { icon: Code2, title: 'Paste code', description: 'Drop a snippet and get security, reliability, and quality feedback.' },
  { icon: GitBranch, title: 'Connect repos', description: 'Prepare pull request review flows for real project work.' },
  { icon: ShieldCheck, title: 'Ship safer', description: 'Catch secrets, unsafe execution, and fragile error paths before release.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#080a0f] text-white">
      <header className="border-b border-white/10 bg-[#080a0f]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300 text-gray-950">
              <Zap size={16} />
            </span>
            <span className="text-sm font-semibold tracking-tight">Reviewly AI</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-gray-400 md:flex">
            <a href="#workspace" className="hover:text-white">Workspace</a>
            <a href="#flow" className="hover:text-white">Flow</a>
            <a href="#security" className="hover:text-white">Security</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/auth/signin" className="rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white">
              Sign in
            </Link>
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-cyan-100"
            >
              Start
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section id="workspace" className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 px-4 py-8 md:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-cyan-200">
              <Sparkles size={14} />
              Prompt-first code review workspace
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Review AI-generated code before it reaches production.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-400">
              Reviewly turns pasted code and repository work into structured findings, scores, and fix guidance through a fast backend analyzer and Supabase-backed reports.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/auth/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-gray-950 hover:bg-cyan-200"
              >
                Create a review
                <Play size={16} />
              </Link>
              <Link
                to="/auth/signin"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white hover:bg-white/[0.07]"
              >
                Open dashboard
                <TerminalSquare size={16} />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {metrics.map(metric => (
                <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                  <div className="mt-1 text-xs text-gray-500">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1118] shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Code2 size={16} className="text-cyan-200" />
                user-session.ts
              </div>
              <span className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-xs text-emerald-200">Backend connected</span>
            </div>

            <div className="grid lg:grid-cols-[1fr_18rem]">
              <div className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
                <div className="mb-3 rounded-lg border border-white/10 bg-[#080a0f] p-3">
                  <p className="text-xs text-gray-500">Prompt</p>
                  <p className="mt-1 text-sm text-gray-200">Find security and reliability risks, then suggest safe fixes.</p>
                </div>
                <pre className="overflow-x-auto rounded-lg bg-[#07090d] p-4 text-sm leading-7 text-gray-300">
                  {sampleCode.map((line, index) => (
                    <div key={line} className={index === 1 || index === 2 || index === 4 ? 'bg-red-400/10 text-red-100' : ''}>
                      <span className="mr-4 inline-block w-5 text-right text-gray-600">{index + 1}</span>
                      {line}
                    </div>
                  ))}
                </pre>
              </div>

              <aside className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Review output</p>
                    <p className="text-xs text-gray-500">Generated in one pass</p>
                  </div>
                  <span className="text-2xl font-bold text-cyan-200">67</span>
                </div>

                <div className="space-y-2">
                  {findings.map(finding => (
                    <div key={finding.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-white">{finding.label}</span>
                        <span className={finding.severity === 'critical' ? 'text-xs text-red-300' : 'text-xs text-amber-300'}>
                          L{finding.line}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{finding.severity}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
                  Remove exposed secrets, replace eval, and route logs through a safe logger.
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="flow" className="border-y border-white/10 bg-white/[0.02] px-4 py-16 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Built like a builder, focused on review</h2>
                <p className="mt-2 text-sm text-gray-400">Launch from a prompt, inspect code, and save a report without leaving the workbench.</p>
              </div>
              <Link to="/auth/signup" className="text-sm font-semibold text-cyan-200 hover:text-white">
                Try the workspace
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {workflows.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-white/10 bg-[#0d1118] p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-cyan-200">
                      <Icon size={19} />
                    </div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="security" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-2xl font-bold">Backend-ready architecture</h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                The frontend calls the Node analyzer through `VITE_REVIEW_API_URL`, then stores authenticated review data in Supabase. If the backend is offline, the browser analyzer keeps the workflow available.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0d1118] p-5">
              {['React workspace', 'Node review API', 'Supabase Auth + Postgres', 'Realtime dashboard refresh'].map((step, index) => (
                <div key={step} className="flex items-center gap-3 border-b border-white/10 py-3 last:border-b-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] text-xs font-bold text-cyan-200">{index + 1}</div>
                  <span className="text-sm text-gray-200">{step}</span>
                  <CheckCircle2 size={16} className="ml-auto text-emerald-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
