import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Check, Star, GitPullRequest, Shield, Cpu, Users, ChevronRight, Code2 } from 'lucide-react';

const SAMPLE_CODE = `// AI-generated code with issues
async function fetchUserData(userId) {
  const password = "secret123"; // exposed credential
  console.log("Fetching user:", userId);

  try {
    const res = await fetch('/api/users/' + userId);
    const data = await res.json();
    eval(data.script); // dangerous eval()
    return data;
  } catch(e) {
    console.log(e); // no error handling
  }
}`;

const REVIEWED_CODE = `// CodeLensAI fixed version
async function fetchUserData(userId: string) {
  // Removed: hardcoded credentials
  // Removed: console.log statements

  try {
    const res = await fetch(\`/api/users/\${userId}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);

    const data = await res.json();
    // Removed: dangerous eval() call
    return data;
  } catch (error) {
    logger.error('fetchUserData failed', { userId, error });
    throw error;
  }
}`;

const ISSUES = [
  { line: 2, severity: 'critical', msg: 'Hardcoded credential detected' },
  { line: 3, severity: 'warning', msg: 'console.log in production code' },
  { line: 7, severity: 'critical', msg: 'eval() - remote code execution risk' },
  { line: 9, severity: 'error', msg: 'Swallowed exception, no re-throw' },
];

const STATS = [
  { value: '98%', label: 'Fewer critical bugs shipped' },
  { value: '5x', label: 'Faster code review cycles' },
  { value: '41%', label: 'AI code in production today' },
  { value: '<10s', label: 'PR auto-review time' },
];

const PERSONAS = [
  { icon: Code2, title: 'Solo Developers', desc: 'Catch what Copilot misses before it ships. No reviewer needed.', color: 'cyan' },
  { icon: Users, title: 'Engineering Teams', desc: 'Shared rule templates, RBAC, team analytics, and PR auto-comments.', color: 'blue' },
  { icon: Shield, title: 'Security Teams', desc: 'Detect injections, credential leaks, and OWASP top-10 instantly.', color: 'emerald' },
];

const COLOR_CLASSES = {
  cyan: { box: 'bg-cyan-500/10 border-cyan-500/20', icon: 'text-cyan-400' },
  blue: { box: 'bg-blue-500/10 border-blue-500/20', icon: 'text-blue-400' },
  emerald: { box: 'bg-emerald-500/10 border-emerald-500/20', icon: 'text-emerald-400' },
  red: { box: 'bg-red-500/10 border-red-500/20', icon: 'text-red-400' },
  yellow: { box: 'bg-yellow-500/10 border-yellow-500/20', icon: 'text-yellow-400' },
};

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Senior Engineer @ Vercel', avatar: 'SC', text: 'CodeLensAI caught 3 critical secrets in our AI-generated code that our team missed completely. Worth every penny.' },
  { name: 'Marcus Webb', role: 'CTO @ Fintech Startup', avatar: 'MW', text: 'We went from 2-day PR review cycles to under 10 minutes with auto-review webhooks. Game changer.' },
  { name: 'Priya Sharma', role: 'Lead Dev @ E-commerce Co.', avatar: 'PS', text: 'The Monaco Editor integration feels exactly like VS Code. Inline decorations are brilliant.' },
];

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number }> = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function Landing() {
  const [activeIssue, setActiveIssue] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveIssue(i => (i + 1) % ISSUES.length), 2000);
    return () => clearInterval(t);
  }, []);

  const severityColor = (s: string) => {
    if (s === 'critical') return 'text-red-400 border-red-500/30 bg-red-500/10';
    if (s === 'error') return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
    return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden">
      {/* Announcement banner */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border-b border-cyan-500/20 py-2 px-4 text-center text-sm">
        <span className="text-gray-400">New: </span>
        <span className="text-cyan-400 font-medium">GitHub PR Auto-Review</span>
        <span className="text-gray-400"> - post inline comments in under 10 seconds </span>
        <Link to="/auth/signup" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 ml-1">Try free &gt;</Link>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-xl border-b border-gray-800/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-cyan-400/30 blur-md" />
            </div>
            <span className="font-bold text-white">CodeLensAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth/signin" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">Sign in</Link>
            <Link
              to="/auth/signup"
              className="text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-1.5 rounded-lg transition-all shadow-lg shadow-cyan-500/25"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <ParticleCanvas />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-xs text-cyan-400 mb-8">
            <Zap size={12} />
            <span>Hybrid LLM + Linter Analysis</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
            <span className="text-white">What will you</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              review today?
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The AI code review platform built for teams shipping Copilot-generated code.
            Catch critical bugs, security issues, and anti-patterns in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/auth/signup"
              className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-4 rounded-xl text-base transition-all shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/40 hover:-translate-y-0.5"
            >
              Start reviewing free
              <ArrowRight size={18} />
            </Link>
            <a
              href="#demo"
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-xl text-base transition-all"
            >
              <GitPullRequest size={18} />
              See live demo
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-1">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">See it in action</h2>
            <p className="text-gray-400 text-lg">Paste code. Get instant hybrid analysis.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Original code */}
            <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/60 bg-gray-900/40">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-xs text-gray-500 ml-2 font-mono">userService.js</span>
                <span className="ml-auto text-xs text-red-400 border border-red-500/20 bg-red-500/10 px-2 py-0.5 rounded">4 issues</span>
              </div>
              <div className="relative">
                <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto leading-6">
                  {SAMPLE_CODE.split('\n').map((line, i) => {
                    const issue = ISSUES.find(iss => iss.line === i + 1);
                    return (
                      <div key={i} className={`flex group ${issue && activeIssue === ISSUES.indexOf(issue) ? 'bg-red-500/10' : ''}`}>
                        <span className="text-gray-600 w-6 text-right flex-shrink-0 mr-3 select-none">{i + 1}</span>
                        <span className={issue ? 'text-red-300/90' : ''}>{line}</span>
                        {issue && (
                          <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border ${severityColor(issue.severity)} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                            {issue.msg}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </pre>
              </div>
              {/* Issue list */}
              <div className="border-t border-gray-800/60 p-3 space-y-1.5">
                {ISSUES.map((issue, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-all ${i === activeIssue ? 'bg-gray-800/80' : ''}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${issue.severity === 'critical' ? 'bg-red-400' : issue.severity === 'error' ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                    <span className="text-gray-500">Line {issue.line}</span>
                    <span className={`font-medium ${issue.severity === 'critical' ? 'text-red-300' : issue.severity === 'error' ? 'text-orange-300' : 'text-yellow-300'}`}>{issue.msg}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed code */}
            <div className="bg-gray-900/60 border border-emerald-500/20 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/60 bg-gray-900/40">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-xs text-gray-500 ml-2 font-mono">userService.fixed.ts</span>
                <span className="ml-auto text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded">All fixed</span>
              </div>
              <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto leading-6">
                {REVIEWED_CODE.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    <span className="text-gray-600 w-6 text-right flex-shrink-0 mr-3 select-none">{i + 1}</span>
                    <span className={line.startsWith('  //') ? 'text-emerald-400/70' : ''}>{line}</span>
                  </div>
                ))}
              </pre>
              <div className="border-t border-gray-800/60 p-3">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <Check size={14} />
                  <span>Score improved: 23 to 97 / 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-gray-400 text-lg">Built for the 84% of developers already using AI assistants</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Cpu, title: 'Hybrid LLM + Linter', desc: 'Combines GPT-4/Claude deep analysis with ESLint/Semgrep rules for zero false negatives.', color: 'cyan' },
              { icon: GitPullRequest, title: 'GitHub Auto-Review', desc: 'Webhook integration posts inline PR comments in under 10 seconds automatically.', color: 'blue' },
              { icon: Code2, title: 'Monaco Editor', desc: 'Full VS Code experience with inline issue decorations, 16+ languages, and glyph margin.', color: 'emerald' },
              { icon: Users, title: 'Team Workspaces', desc: 'RBAC roles, shared review templates, custom regex rules, and team analytics.', color: 'cyan' },
              { icon: Shield, title: 'Security-First', desc: 'OWASP Top 10, credential detection, injection patterns, and eval() usage flagged instantly.', color: 'red' },
              { icon: Star, title: 'Export Reports', desc: 'Generate professional PDF or Markdown compliance reports with structured issue data.', color: 'yellow' },
            ].map(f => (
              <div key={f.title} className="group bg-gray-900/40 border border-gray-800/60 rounded-2xl p-6 hover:border-gray-700/80 transition-all hover:-translate-y-1">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${COLOR_CLASSES[f.color as keyof typeof COLOR_CLASSES].box}`}>
                  <f.icon size={20} className={COLOR_CLASSES[f.color as keyof typeof COLOR_CLASSES].icon} />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Persona cards */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for your team</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PERSONAS.map(p => (
              <div key={p.title} className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-800/60 rounded-2xl p-8 text-center">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-4 ${COLOR_CLASSES[p.color as keyof typeof COLOR_CLASSES].box}`}>
                  <p.icon size={24} className={COLOR_CLASSES[p.color as keyof typeof COLOR_CLASSES].icon} />
                </div>
                <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                <p className="text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-gradient-to-b from-transparent to-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by developers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-4">Start reviewing in seconds</h2>
            <p className="text-gray-400 mb-8 text-lg">Free plan. No credit card. Instant analysis.</p>
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-10 py-4 rounded-xl text-base transition-all shadow-xl shadow-cyan-500/30 hover:-translate-y-0.5"
            >
              Get started free
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Zap size={12} className="text-white" />
                </div>
                <span className="font-bold text-sm">CodeLensAI</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">AI-powered code review for teams shipping Copilot-generated code.</p>
            </div>
            {[
              { label: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { label: 'Developers', links: ['Documentation', 'API Reference', 'GitHub', 'Status'] },
              { label: 'Company', links: ['About', 'Blog', 'Careers', 'Privacy'] },
            ].map(col => (
              <div key={col.label}>
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">{col.label}</div>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800/60 pt-8 text-center text-xs text-gray-600">
            Copyright 2026 CodeLensAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
