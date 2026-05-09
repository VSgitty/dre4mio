import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-monopol-darker via-monopol-dark to-monopol-darker">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-monopol-neon/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-monopol-purple/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-monopol-neon via-monopol-accent to-monopol-purple bg-clip-text text-transparent mb-6">
            MONOPOL STUDIO
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            The AI Cinematic Creation Operating System
          </p>

          <p className="text-base md:text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Create animated series, movies, and cinematic stories from your sketches, photos, and ideas.
            Powered by cutting-edge AI and intuitive creative tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-gradient-to-r from-monopol-accent to-monopol-neon text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-monopol-accent/50 transition-all duration-300"
            >
              Start Creating Free
            </Link>

            <Link
              href="/auth/login"
              className="px-8 py-4 border-2 border-monopol-neon text-monopol-neon font-semibold rounded-lg hover:bg-monopol-neon/10 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-monopol-dark/50 backdrop-blur-md border-t border-monopol-neon/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-monopol-neon to-monopol-accent bg-clip-text text-transparent">
            Cinematic Creation, Simplified
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Paper to Digital',
                description: 'Sketch your ideas on paper, photograph them, and watch AI bring your drawings to life.',
                icon: '✏️',
              },
              {
                title: 'AI Director',
                description: 'Chat with an AI that understands filmmaking. Generate scenes, animations, and effects naturally.',
                icon: '🎬',
              },
              {
                title: 'Professional Export',
                description: 'Export cinematic sequences in MP4, shorts format, or share directly to social media.',
                icon: '🎞️',
              },
              {
                title: 'Infinite Canvas',
                description: 'Drag, drop, and arrange assets on an infinite canvas with professional tools.',
                icon: '🖼️',
              },
              {
                title: 'Timeline Engine',
                description: 'Industry-standard timeline editor for precise control over every frame.',
                icon: '⏱️',
              },
              {
                title: 'Cloud Collaboration',
                description: 'Save projects in the cloud and collaborate with other creators in real-time.',
                icon: '☁️',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-lg border border-monopol-neon/20 bg-monopol-darker/50 backdrop-blur hover:border-monopol-neon/50 transition-all duration-300 hover:shadow-lg hover:shadow-monopol-neon/10"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-monopol-neon">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
