"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ThinkingPanel({ reasoning }: { reasoning: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BrainCircuit size={14} className="text-indigo-400" />
          <span className="font-medium tracking-wide">Agent Reasoning</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      
      {isOpen && (
        <div className="px-3 py-2.5 text-xs text-zinc-400 border-t border-zinc-800/50 leading-relaxed font-mono">
          {reasoning}
        </div>
      )}
    </div>
  );
}
