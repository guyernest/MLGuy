'use client';

import { motion } from 'framer-motion';
import { Lock, ShieldAlert, KeyRound } from 'lucide-react';
import { SiRust } from 'react-icons/si';

export default function TrustBanner() {
  return (
    <section className="py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-lcars-blue/5 skew-y-3 origin-bottom-left" />
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex-1"
        >
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Lock className="text-lcars-blue w-8 h-8" />
            Uncompromising Security
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            When you integrate with our MCP infrastructure, you&apos;re building on top of the most secure, privacy-first protocol implementations available. Whether you&apos;re using our single-tenant AWS deployments or our open-source Rust SDK, your data privacy is mathematically and structurally guaranteed.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm font-mono text-lcars-blue bg-lcars-blue/10 px-3 py-1 rounded-full border border-lcars-blue/20">
              <ShieldAlert className="w-4 h-4" />
              Zero-Trust
            </div>
            <div className="flex items-center gap-2 text-sm font-mono text-lcars-orange bg-lcars-orange/10 px-3 py-1 rounded-full border border-lcars-orange/20">
              <KeyRound className="w-4 h-4" />
              E2E Encryption
            </div>
            <div className="flex items-center gap-2 text-sm font-mono text-[#dea584] bg-[#dea584]/10 px-3 py-1 rounded-full border border-[#dea584]/20">
              <SiRust className="w-4 h-4" />
              Memory-Safe
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-6 border-l-2 border-lcars-purple pl-4">
            * Our infrastructure is powered by <strong className="text-white">Rust</strong>. By eliminating entire classes of memory safety vulnerabilities, we drastically reduce the surface area for cyber attacks, ensuring your deployments remain impenetrable.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex-1 w-full"
        >
          {/* LCARS stylized data panel */}
          <div className="glass-card p-6 flex flex-col gap-4">
             <div className="flex justify-between items-center border-b border-white/10 pb-2">
               <span className="text-xs font-mono text-gray-500">SYS_SECURITY_LOG</span>
               <div className="flex gap-1">
                 <div className="w-8 h-2 bg-lcars-blue rounded-full"></div>
                 <div className="w-2 h-2 bg-lcars-orange rounded-full"></div>
               </div>
             </div>
             <div className="font-mono text-sm space-y-2 text-gray-400">
               <p><span className="text-lcars-blue">[AUTH]</span> Handshake verified.</p>
               <p><span className="text-lcars-purple">[DATA]</span> Isolation boundaries intact.</p>
               <p><span className="text-lcars-orange">[MCP]</span> Context fully encrypted.</p>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
