'use client';

import { motion } from 'framer-motion';
import { Server, ShieldCheck, Cpu } from 'lucide-react';

const stackItems = [
  {
    title: 'Rust MCP SDK',
    description: 'The most complete, batteries-included, and secure open-source Rust SDK for the Model Context Protocol.',
    icon: <ShieldCheck className="w-8 h-8 text-lcars-blue" />,
    link: 'https://github.com/paiml/rust-mcp-sdk',
    color: 'bg-lcars-blue'
  },
  {
    title: 'pmcp.run Hosting',
    description: 'Advanced serverless MCP hosting on AWS. Also available as a single-tenant private deployment for enterprise companies.',
    icon: <Server className="w-8 h-8 text-lcars-orange" />,
    link: '#',
    color: 'bg-lcars-orange'
  },
  {
    title: 'Groundbreaking MCP Apps',
    description: 'Demonstrating the power of AI with seamless chat interface integrations (ChatGPT, Claude, Gemini) and secure connectors.',
    icon: <Cpu className="w-8 h-8 text-lcars-purple" />,
    link: '#apps',
    color: 'bg-lcars-purple'
  }
];

export default function StackSection() {
  return (
    <section id="stack" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 md:flex justify-between items-end border-b border-white/10 pb-6"
        >
          <div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">The <span className="text-white">MCP</span> Stack</h2>
            <p className="text-gray-400 max-w-2xl">
              A comprehensive suite of tools, SDKs, and hosting platforms designed to power the next generation of AI-driven applications.
            </p>
          </div>
          {/* LCARS Detail */}
          <div className="hidden md:flex gap-2 h-4 mt-6">
            <div className="w-16 bg-lcars-pale-orange rounded-full" />
            <div className="w-8 bg-lcars-orange rounded-full" />
            <div className="w-4 bg-lcars-purple rounded-full" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stackItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="glass-card p-8 group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${item.color} opacity-10 rounded-bl-full group-hover:scale-150 transition-transform duration-500`} />
              
              <div className="mb-6">{item.icon}</div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                {item.description}
              </p>
              <a href={item.link} className={`text-sm font-semibold hover:underline decoration-${item.color.replace('bg-', '')}`}>
                Learn more &rarr;
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
