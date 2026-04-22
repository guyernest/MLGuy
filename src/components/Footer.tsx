

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-auto py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">ML<span className="text-primary">Guy</span></h3>
          <p className="text-gray-400 text-sm">
            Building the future of secure, advanced AI integrations through the Model Context Protocol.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-white">Trust & Security</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            Privacy and security are our top priorities. Our enterprise-grade solutions ensure your data remains completely under your control.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-white">Connect</h4>
          <ul className="flex flex-col gap-2 text-sm text-gray-400">
            <li><a href="https://github.com/paiml/rust-mcp-sdk" target="_blank" rel="noreferrer" className="hover:text-white transition">GitHub</a></li>
            <li><a href="https://guyernest.medium.com/" target="_blank" rel="noreferrer" className="hover:text-white transition">Medium</a></li>
            <li><a href="https://dev.to/guyernest" target="_blank" rel="noreferrer" className="hover:text-white transition">Dev.to</a></li>
            <li><a href="https://www.linkedin.com/in/guyernest/" target="_blank" rel="noreferrer" className="hover:text-white transition">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} MLGuy. All rights reserved.
      </div>
    </footer>
  );
}
