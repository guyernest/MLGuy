'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, DollarSign, Target, Gamepad2, Blocks } from 'lucide-react';
import Link from 'next/link';

const mcpApps = [
  {
    title: 'Cost Coach',
    description: 'Optimize your cloud costs with ease. An intelligent AI-driven coach that continuously analyzes your infrastructure spending and recommends actionable savings.',
    icon: <DollarSign className="w-8 h-8 text-lcars-orange" />,
    status: 'Live',
    link: 'https://cost-coach-landing.us-west.pmcp.run/',
    color: 'bg-lcars-orange',
    textColor: 'text-lcars-orange',
  },
  {
    title: 'Chess Coach',
    description: 'A great way for beginners and intermediate players to improve their chess game. Leverages advanced game analysis via MCP to offer contextual, AI-guided tutorials and practice.',
    icon: <Target className="w-8 h-8 text-lcars-blue" />,
    status: 'Coming Soon',
    link: '#',
    color: 'bg-lcars-blue',
    textColor: 'text-lcars-blue',
  },
  {
    title: 'Roblox Memories',
    description: 'Customize Roblox games for kids\' parties and celebrations. Seamlessly include family pictures and events, and share these remote multiplayer experiences with family members anywhere.',
    icon: <Gamepad2 className="w-8 h-8 text-lcars-purple" />,
    status: 'In Pipeline',
    link: '#',
    color: 'bg-lcars-purple',
    textColor: 'text-lcars-purple',
  }
];

export default function AppsSection() {
  return (
    <section id="apps" className="py-24 px-6 relative">
      {/* Background LCARS stylistic element */}
      <div className="absolute right-0 top-1/4 w-32 h-64 bg-lcars-blue rounded-l-full opacity-5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 md:flex justify-between items-end border-b border-white/10 pb-6"
        >
          <div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight flex items-center gap-4">
              <Blocks className="w-8 h-8 text-lcars-orange" />
              <span className="text-white">MCP</span> Apps Ecosystem
            </h2>
            <p className="text-gray-400 max-w-2xl leading-relaxed">
              A growing suite of intelligent applications demonstrating the true power of AI when deeply integrated with specific data systems and workflows.
            </p>
          </div>
          {/* LCARS Detail */}
          <div className="hidden md:flex gap-2 h-4 mt-6">
            <div className="w-8 bg-lcars-blue rounded-full" />
            <div className="w-32 bg-lcars-orange rounded-full" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mcpApps.map((app, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="group relative"
            >
              <div className="glass-card p-8 h-full flex flex-col border-t-2 border-t-transparent hover:border-t-white/30 transition-all duration-300 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 ${app.color} opacity-10 rounded-bl-full group-hover:scale-150 transition-transform duration-500`} />

                <div className="flex justify-between items-start mb-6 z-10">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    {app.icon}
                  </div>
                  <span className={`text-xs font-mono px-3 py-1 rounded-full text-black font-semibold ${app.status === 'Live' ? 'bg-lcars-orange' :
                      app.status === 'Coming Soon' ? 'bg-lcars-blue' : 'bg-gray-400'
                    }`}>
                    {app.status}
                  </span>
                </div>

                <h3 className={`text-2xl font-bold mb-3 ${app.textColor} transition-colors z-10`}>
                  {app.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow z-10">
                  {app.description}
                </p>

                <div className="z-10 mt-auto pt-4 border-t border-white/10">
                  {app.status === 'Live' ? (
                    <Link href={app.link} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 text-sm font-semibold hover:underline ${app.textColor}`}>
                      Launch App <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <span className="text-sm font-mono text-gray-500 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
                      Awaiting Release
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Placeholder for future apps to show pipeline flexibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="glass-card p-8 h-full flex flex-col justify-center items-center text-center border-dashed border-2 border-white/10 hover:border-white/20 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <span className="text-2xl text-gray-500">+</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-400">More Apps Incoming</h3>
            <p className="text-sm text-gray-500">We are continuously expanding the MCP ecosystem.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
