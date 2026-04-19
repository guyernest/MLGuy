'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 px-6">
      
      {/* Background LCARS stylistic elements */}
      <div className="absolute left-0 top-1/4 w-8 h-64 bg-lcars-orange rounded-r-full opacity-20 blur-xl" />
      <div className="absolute right-0 bottom-1/4 w-12 h-48 bg-lcars-blue rounded-l-full opacity-20 blur-xl" />
      
      {/* LCARS structural frame */}
      <div className="absolute left-4 top-32 bottom-12 w-6 flex flex-col gap-2 opacity-80 hidden md:flex">
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: '100px' }}
          className="w-full bg-lcars-orange rounded-t-full"
        />
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full h-12 bg-lcars-pale-orange"
        />
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full h-8 bg-lcars-blue"
        />
        <motion.div 
          initial={{ flexGrow: 0 }}
          animate={{ flexGrow: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full flex-grow bg-lcars-purple rounded-b-full"
        />
      </div>

      <div className="max-w-4xl mx-auto z-10 text-center md:pl-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            The Future of <span className="text-lcars-orange">AI Integration</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Groundbreaking Model Context Protocol solutions, secure Rust SDKs, and enterprise serverless hosting.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#stack">
              <button className="bg-lcars-orange hover:bg-orange-500 text-black font-semibold px-8 py-4 rounded-full transition-all flex items-center gap-2 hover:scale-105 active:scale-95">
                Explore The Stack
              </button>
            </Link>
            <Link href="https://github.com/paiml/rust-mcp-sdk" target="_blank" rel="noreferrer">
              <button className="glass-card hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-full transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer">
                Rust MCP SDK
              </button>
            </Link>
          </div>
        </motion.div>

        {/* System Status Indicators (Futuristic detail) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-16 flex justify-center gap-8 text-sm font-mono text-gray-500"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lcars-blue animate-pulse"></span>
            SYS_ONLINE
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lcars-orange animate-pulse"></span>
            MCP_READY
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lcars-purple animate-pulse"></span>
            SEC_ENCRYPTED
          </div>
        </motion.div>
      </div>
    </section>
  );
}
