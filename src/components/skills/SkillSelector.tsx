"use client";

import React from 'react';
import { db } from '@/lib/storage/dexie';
import { useWorkspaceStore } from '@/lib/storage/store';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';
import { Code2, FileText, Image, Video, MonitorPlay } from 'lucide-react';

const SKILLS = [
  { id: 'code-writer', label: 'Code Writer', icon: Code2 },
  { id: 'document-analysis', label: 'Docs', icon: FileText },
  { id: 'web-reasoning', label: 'Web Reasoning', icon: MonitorPlay },
  { id: 'vision', label: 'Vision', icon: Image },
  { id: 'video-gen', label: 'Video Gen', icon: Video },
];

export default function SkillSelector() {
  const { activeSessionId } = useWorkspaceStore();
  
  const session = useLiveQuery(
    () => activeSessionId ? db.sessions.get(activeSessionId) : undefined,
    [activeSessionId]
  );

  if (!session) return null;

  const toggleSkill = async (skillId: string) => {
    const isEnabled = session.skillsEnabled.includes(skillId);
    let newSkills = [...session.skillsEnabled];
    
    if (isEnabled) {
      newSkills = newSkills.filter(id => id !== skillId);
    } else {
      newSkills.push(skillId);
    }

    await db.sessions.update(session.id, { skillsEnabled: newSkills });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {SKILLS.map(skill => {
        const Icon = skill.icon;
        const isActive = session.skillsEnabled.includes(skill.id);
        return (
          <button
            key={skill.id}
            onClick={() => toggleSkill(skill.id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-colors duration-200",
              isActive 
                ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300" 
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
            )}
          >
            <Icon size={12} />
            <span>{skill.label}</span>
          </button>
        );
      })}
    </div>
  );
}
