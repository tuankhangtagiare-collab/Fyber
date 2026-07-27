"use client";

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/storage/dexie';
import { useWorkspaceStore } from '@/lib/storage/store';
import { MessageSquare, Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SessionList({ projectId }: { projectId: string }) {
  const { activeSessionId, setActiveSession } = useWorkspaceStore();
  
  const sessions = useLiveQuery(
    () => db.sessions.where('projectId').equals(projectId).reverse().sortBy('updatedAt'),
    [projectId]
  );

  const handleNewSession = async () => {
    const id = crypto.randomUUID();
    await db.sessions.add({
      id,
      projectId,
      name: 'New Chat',
      pinned: false,
      modelId: 'qwen-max',
      provider: 'qwen',
      thinkingLevel: 'Off',
      skillsEnabled: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastMessageAt: Date.now(),
      executionState: 'idle'
    });
    setActiveSession(id);
  };

  if (!sessions) return null;

  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-2 group">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sessions</h3>
        <button 
          onClick={handleNewSession}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="px-2 py-2 text-xs text-zinc-500 italic">No sessions.</div>
      ) : (
        <div className="space-y-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={cn(
                "group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors",
                activeSessionId === session.id 
                  ? "bg-zinc-800/80 text-zinc-100" 
                  : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare size={14} className={activeSessionId === session.id ? "text-indigo-400" : "text-zinc-500"} />
                <span className="truncate">{session.name}</span>
              </div>
              <button className="p-1 hover:text-zinc-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
