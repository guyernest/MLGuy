'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const blogPosts = [
  {
    platform: 'Medium',
    title: "IT Managers' Strategic Guide to MCP",
    excerpt: 'A strategic overview of the Model Context Protocol (MCP) and how it addresses the challenges of securely integrating enterprise data with AI.',
    link: 'https://medium.com/@guyernest/it-managers-strategic-guide-to-mcp-a30918111dbe',
    color: 'bg-lcars-blue'
  },
  {
    platform: 'Dev.to',
    title: 'Code Mode for MCP: The Long-Tail Escape Hatch, Not the Front Door',
    excerpt: 'Examining when and how to utilize Code Mode effectively for custom MCP integrations, treating it as an escape hatch rather than the primary entry point.',
    link: 'https://dev.to/guyernest/code-mode-for-mcp-the-long-tail-escape-hatch-not-the-front-door-4j7j-temp-slug-7349109?preview=9a9367238720d2cb99d2050a9221e1cb7a8c7f78b53d74e8cc06e690e1697f5ba7a4ee8d2fc3b3842cd236b5ce691b8339cc7061ae89fb471a9ee7d6',
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
              className="group cursor-pointer block"
            >
              <a href={post.link} target="_blank" rel="noreferrer">
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
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
