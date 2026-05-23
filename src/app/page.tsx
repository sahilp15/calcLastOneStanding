'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, Zap, Trophy, BookOpen } from 'lucide-react'

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, #0a0a0f 60%)',
      }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
          style={{
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            color: '#a78bfa',
          }}
        >
          <Zap size={14} /> Real-time classroom competition
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-7xl md:text-8xl font-black mb-6 leading-tight"
        >
          <span
            style={{
              background:
                'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Last One
            <br />
            Standing
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          The real-time elimination game for Calculus class. Answer correctly or
          get eliminated. Last student standing wins.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link
            href="/host"
            className="group px-8 py-4 rounded-xl text-lg font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              boxShadow: '0 0 30px rgba(124,58,237,0.3)',
            }}
          >
            <span className="flex items-center gap-2 justify-center">
              <Trophy size={20} /> Host a Game
            </span>
          </Link>
          <Link
            href="/play"
            className="group px-8 py-4 rounded-xl text-lg font-bold text-white transition-all duration-200 hover:scale-105 border"
            style={{
              background: 'rgba(6,182,212,0.1)',
              borderColor: 'rgba(6,182,212,0.4)',
            }}
          >
            <span className="flex items-center gap-2 justify-center">
              <Users size={20} /> Join a Game
            </span>
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: <Zap className="text-yellow-400" />,
              title: 'Real-time Elimination',
              desc: 'Wrong answer = instant out. Server-authoritative timers keep it fair.',
            },
            {
              icon: <BookOpen className="text-purple-400" />,
              title: 'Beautiful Math',
              desc: 'LaTeX-rendered calculus problems. Series, convergence, Taylor, and more.',
            },
            {
              icon: <Users className="text-cyan-400" />,
              title: '30–100 Players',
              desc: 'Built for the full classroom. Reconnect-safe architecture.',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl text-left"
              style={{ background: 'rgba(19,19,26,0.8)', border: '1px solid #1e1e2e' }}
            >
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Admin link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <Link
            href="/admin"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Admin Panel
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
