'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const blogPosts = [
  {
    platform: 'Medium',
    title: 'The Future of AI Integration with MCP',
    excerpt: 'Exploring how the Model Context Protocol is revolutionizing the way AI agents interact with local and remote data systems.',
    link: '#',
    color: 'bg-lcars-blue'
  },
  {
    platform: 'Dev.to',
    title: 'Building Secure Rust SDKs for AI',
    excerpt: 'A deep dive into the architecture of our open-source Rust MCP SDK and why security must be a first-class citizen.',
    link: '#',
    color: 'bg-lcars-orange'
  }
];

export default function BlogSection() {
  return (
    <section id="blog" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 tracking-tight flex items-center gap-4">
            <div className="w-2 h-8 bg-lcars-purple rounded-full" />
            Latest Thoughts
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogPosts.map((post, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="group cursor-pointer"
            >
              <div className="glass-card p-8 h-full border-t-4 border-t-transparent hover:border-t-lcars-purple transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <span className={`text-xs font-mono px-3 py-1 rounded-full text-black font-semibold ${post.color}`}>
                    {post.platform}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-lcars-blue transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-400">
                  {post.excerpt}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
