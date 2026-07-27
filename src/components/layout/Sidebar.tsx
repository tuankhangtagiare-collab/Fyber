"use client";

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/lib/storage/store';
import { db } from '@/lib/storage/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { FolderPlus, Settings, Command } from 'lucide-react';
import ProjectList from '../projects/ProjectList';
import SessionList from '../sessions/SessionList';

export default function Sidebar() {
  const { activeProjectId, setActiveProject } = useWorkspaceStore();

  const handleNewProject = async () => {
    const id = crypto.randomUUID();
    await db.projects.add({
      id,
      name: 'New Project',
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: 0,
    });
    setActiveProject(id);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/30">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 font-medium text-zinc-100">
          <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-xs border border-zinc-700">
            F
          </div>
          <span>Fyber</span>
        </div>
        <button className="text-zinc-400 hover:text-zinc-100 p-1">
          <Command size={16} />
        </button>
      </div>

      {/* Projects Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <div>
          <div className="flex items-center justify-between px-2 mb-2 group">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Projects</h3>
            <button 
              onClick={handleNewProject}
              className="text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FolderPlus size={14} />
            </button>
          </div>
          <ProjectList />
        </div>

        {/* Sessions Section (only if project is active) */}
        {activeProjectId && (
          <div>
            <SessionList projectId={activeProjectId} />
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-zinc-800/50 shrink-0">
        <button className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors w-full p-2 rounded-md hover:bg-zinc-800/50">
          <Settings size={16} />
          Settings
        </button>
      </div>
    </div>
  );
}
