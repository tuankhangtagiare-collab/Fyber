"use client";

import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/lib/storage/store';
import { db } from '@/lib/storage/dexie';
import { Search, Plus, Trash2, FolderPlus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { setActiveProject, setActiveSession, activeProjectId } = useWorkspaceStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const handleAction = async (action: string) => {
    setIsOpen(false);
    switch (action) {
      case 'new_project': {
        const id = crypto.randomUUID();
        await db.projects.add({
          id, name: 'New Project', pinned: false, createdAt: Date.now(), updatedAt: Date.now(), order: 0
        });
        setActiveProject(id);
        break;
      }
      case 'new_session': {
        if (!activeProjectId) return;
        const id = crypto.randomUUID();
        await db.sessions.add({
          id, projectId: activeProjectId, name: 'New Chat', pinned: false, modelId: 'qwen-max', provider: 'qwen', thinkingLevel: 'Off', skillsEnabled: [], createdAt: Date.now(), updatedAt: Date.now(), lastMessageAt: Date.now(), executionState: 'idle'
        });
        setActiveSession(id);
        break;
      }
      case 'clear_workspace': {
        if (confirm("Are you sure you want to clear all local data?")) {
           await db.messages.clear();
           await db.sessions.clear();
           await db.projects.clear();
           setActiveProject(null);
           setActiveSession(null);
        }
        break;
      }
    }
  };

  const ACTIONS = [
    { id: 'new_project', label: 'Create New Project', icon: FolderPlus },
    { id: 'new_session', label: 'Create New Session', icon: Plus },
    { id: 'open_settings', label: 'Open Settings', icon: Settings },
    { id: 'clear_workspace', label: 'Clear Local Workspace', icon: Trash2 },
  ];

  const filtered = ACTIONS.filter(a => a.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center px-4 border-b border-zinc-800">
          <Search size={18} className="text-zinc-500 mr-2" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent py-4 outline-none text-zinc-100 placeholder:text-zinc-600"
            placeholder="Type a command or search..."
          />
          <kbd className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-zinc-500 text-sm">No commands found.</div>
          ) : (
            filtered.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  className="w-full flex items-center px-4 py-3 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-colors text-sm"
                >
                  <Icon size={16} className="mr-3 text-zinc-500" />
                  {action.label}
                </button>
              );
            })
          )}
        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 z-[-1]" onClick={() => setIsOpen(false)}></div>
    </div>
  );
}
