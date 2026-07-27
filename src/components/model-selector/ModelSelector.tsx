"use client";

import React, { useState } from 'react';
import { db } from '@/lib/storage/dexie';
import { useWorkspaceStore } from '@/lib/storage/store';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';
import { ChevronDown, Cpu, Sparkles } from 'lucide-react';

const MODELS = [
  { id: 'qwen3.8-max-preview', name: 'Qwen Max', provider: 'qwen', icon: Sparkles },
  { id: 'ds/deepseek-v4-pro', name: 'DeepSeek v4 Pro', provider: 'venesus', icon: Cpu },
  { id: 'ds/deepseek-v4-flash', name: 'DeepSeek v4 Flash', provider: 'venesus', icon: Cpu },
  { id: 'gpt-5.6-sol', name: 'GPT 5.6', provider: 'venesus', icon: Sparkles },
];

export default function ModelSelector() {
  const { activeSessionId } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const session = useLiveQuery(
    () => activeSessionId ? db.sessions.get(activeSessionId) : undefined,
    [activeSessionId]
  );

  if (!session) return null;

  const currentModel = MODELS.find(m => m.id === session.modelId) || MODELS[0];
  const CurrentIcon = currentModel.icon;

  const selectModel = async (modelId: string, provider: string) => {
    await db.sessions.update(session.id, { modelId, provider });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors"
      >
        <CurrentIcon size={12} className="text-zinc-400" />
        <span>{currentModel.name}</span>
        <ChevronDown size={12} className="text-zinc-500" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 pb-1">
          <div className="px-3 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-950/50">
            Available Models
          </div>
          {MODELS.map(m => {
            const Icon = m.icon;
            const isSelected = m.id === session.modelId;
            return (
              <button
                key={m.id}
                onClick={() => selectModel(m.id, m.provider)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors",
                  isSelected ? "bg-zinc-800/80 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={12} className={isSelected ? "text-indigo-400" : "text-zinc-500"} />
                  <span>{m.name}</span>
                </div>
                {m.provider === 'venesus' && (
                  <span className="text-[10px] text-amber-500/70 border border-amber-500/30 rounded px-1">Quota</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
}
