"use client";

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/storage/dexie';
import { useWorkspaceStore } from '@/lib/storage/store';
import { Folder, MoreHorizontal, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjectList() {
  const { activeProjectId, setActiveProject, setActiveSession } = useWorkspaceStore();
  const projects = useLiveQuery(() => db.projects.orderBy('updatedAt').reverse().toArray());

  if (!projects) return <div className="px-2 py-4 text-xs text-zinc-500">Loading projects...</div>;
  if (projects.length === 0) return <div className="px-2 py-2 text-xs text-zinc-500 italic">No projects yet.</div>;

  return (
    <div className="space-y-1">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => {
            setActiveProject(project.id);
            setActiveSession(null); // Reset session when switching project
          }}
          className={cn(
            "group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors",
            activeProjectId === project.id 
              ? "bg-zinc-800/80 text-zinc-100" 
              : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Folder size={14} className={activeProjectId === project.id ? "text-blue-400" : "text-zinc-500"} />
            <span className="truncate">{project.name}</span>
          </div>
          
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            {project.pinned && <Pin size={12} className="text-zinc-500 mr-1" />}
            <button className="p-1 hover:text-zinc-100 rounded">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
