import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 glass-card rounded-none border-t-0 border-x-0 border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          ML<span className="text-primary">Guy</span>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-300 items-center">
          <Link href="/#stack" className="hover:text-white transition-colors">The Stack</Link>
          <Link href="/#apps" className="hover:text-white transition-colors">MCP Apps</Link>
          <Link href="/#blog" className="hover:text-white transition-colors">Blog</Link>
          <Link href="/sandbox" className="text-lcars-orange hover:text-orange-400 font-bold bg-lcars-orange/10 px-3 py-1 rounded-full border border-lcars-orange/20 transition-all flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lcars-orange animate-pulse"></span>
            Test MCP
          </Link>
        </nav>
      </div>
    </header>
  );
}
