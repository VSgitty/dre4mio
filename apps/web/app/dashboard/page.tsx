'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/auth-context';
import { useProjects } from '@/lib/hooks/useProjects';
import { formatDistanceToNow } from 'date-fns';

type ViewMode = 'grid' | 'list';
type SortBy = 'updated' | 'created' | 'name';

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { projects, loading, createProject, deleteProject } = useProjects();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);

  const filtered = projects
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'created')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleCreateProject = useCallback(async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    try {
      const project = await createProject(newProjectName.trim());
      router.push(`/editor/${project.id}`);
    } finally {
      setCreating(false);
      setShowNewProjectModal(false);
      setNewProjectName('');
    }
  }, [newProjectName, createProject, router]);

  return (
    <div className="min-h-screen bg-monopol-darker text-white">
      {/* Top Nav */}
      <header className="border-b border-monopol-neon/10 bg-monopol-dark/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-monopol-neon to-monopol-accent bg-clip-text text-transparent tracking-tight">
              MONOPOL
            </span>
            <span className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">
              Studio
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/assets')}
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/5"
            >
              Assets
            </button>
            <button
              onClick={() => router.push('/dashboard/renders')}
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/5"
            >
              Renders
            </button>
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/5"
            >
              Billing
            </button>
            <div className="w-px h-5 bg-white/10" />
            <button
              onClick={signOut}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-monopol-accent to-monopol-purple flex items-center justify-center text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-gray-400 text-sm mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-monopol-accent to-monopol-neon text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-monopol-accent/30 transition-all duration-200 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-monopol-dark border border-white/10 rounded-lg text-sm focus:outline-none focus:border-monopol-neon/50 placeholder-gray-600"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 bg-monopol-dark border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-monopol-neon/50"
            >
              <option value="updated">Last updated</option>
              <option value="created">Date created</option>
              <option value="name">Name</option>
            </select>

            <div className="flex border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === 'grid' ? 'bg-monopol-neon/20 text-monopol-neon' : 'text-gray-400 hover:text-white'
                }`}
              >
                <GridIcon />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === 'list' ? 'bg-monopol-neon/20 text-monopol-neon' : 'text-gray-400 hover:text-white'
                }`}
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Projects */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-monopol-dark rounded-xl animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onNew={() => setShowNewProjectModal(true)} hasSearch={!!searchQuery} />
        ) : viewMode === 'grid' ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {filtered.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => router.push(`/editor/${project.id}`)}
                  onDelete={() => deleteProject(project.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filtered.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onOpen={() => router.push(`/editor/${project.id}`)}
                onDelete={() => deleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowNewProjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-monopol-dark border border-monopol-neon/20 rounded-xl p-6 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-1">New Project</h2>
              <p className="text-gray-400 text-sm mb-5">Give your cinematic world a name.</p>

              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                placeholder="My First Movie..."
                autoFocus
                className="w-full px-4 py-3 bg-monopol-darker border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-monopol-neon/50 mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1 py-2.5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || creating}
                  className="flex-1 py-2.5 bg-gradient-to-r from-monopol-accent to-monopol-neon text-white font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Project Card ────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onOpen,
  onDelete,
}: {
  project: any;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-monopol-dark border border-white/5 rounded-xl overflow-hidden hover:border-monopol-neon/30 transition-all duration-200 cursor-pointer"
      onClick={onOpen}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-monopol-darker to-monopol-dark relative overflow-hidden">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-monopol-neon/10 border border-monopol-neon/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-monopol-neon/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{project.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </p>
          </div>

          {/* Context menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  className="absolute right-0 mt-1 w-40 bg-monopol-darker border border-white/10 rounded-lg shadow-xl z-20 py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => { setMenuOpen(false); onOpen(); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 text-gray-300"
                  >
                    Open in Editor
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 text-gray-300">
                    Duplicate
                  </button>
                  <div className="border-t border-white/10 my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-500/10 text-red-400"
                  >
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectRow({
  project,
  onOpen,
  onDelete,
}: {
  project: any;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-monopol-dark border border-transparent hover:border-white/5 cursor-pointer transition-all group"
      onClick={onOpen}
    >
      <div className="w-20 h-12 bg-monopol-darker rounded flex-shrink-0 overflow-hidden">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm">{project.name}</h3>
        <p className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
        </p>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onNew, hasSearch }: { onNew: () => void; hasSearch: boolean }) {
  if (hasSearch) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">No projects match your search.</p>
      </div>
    );
  }
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 rounded-2xl bg-monopol-dark border border-monopol-neon/20 flex items-center justify-center mx-auto mb-6">
        <svg className="w-12 h-12 text-monopol-neon/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">No projects yet</h3>
      <p className="text-gray-500 mb-6 text-sm">Create your first cinematic project and bring your world to life.</p>
      <button
        onClick={onNew}
        className="px-6 py-3 bg-gradient-to-r from-monopol-accent to-monopol-neon text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-monopol-accent/30 transition-all text-sm"
      >
        Create First Project
      </button>
    </div>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
