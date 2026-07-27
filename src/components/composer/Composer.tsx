"use client";

import React, { useState } from 'react';
import { db } from '@/lib/storage/dexie';
import { ArrowUp, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import ModelSelector from '../model-selector/ModelSelector';
import SkillSelector from '../skills/SkillSelector';

export default function Composer({ sessionId, sessionProvider }: { sessionId: string; sessionProvider?: string }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const userMsgId = crypto.randomUUID();
    
    // Add user message locally
    await db.messages.add({
      id: userMsgId,
      sessionId,
      role: 'user',
      content: content.trim(),
      createdAt: Date.now(),
      status: 'completed',
    });
    
    // Update session lastMessageAt
    await db.sessions.update(sessionId, { lastMessageAt: Date.now() });

    setContent('');
    setIsSubmitting(false);
    
    // Trigger the agent loop backend (API call) here later
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
      <div className="relative bg-zinc-900 rounded-2xl border border-zinc-800 p-2 flex items-end shadow-2xl">
        <button type="button" className="p-3 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">
          <Paperclip size={20} />
        </button>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Send a message to your agent..."
          className="flex-1 max-h-64 min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none text-zinc-100 placeholder:text-zinc-500 py-3 px-2"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <button 
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className={cn(
            "p-2.5 rounded-xl shrink-0 transition-all mb-0.5 mr-0.5",
            content.trim() && !isSubmitting
              ? "bg-zinc-100 text-zinc-900 hover:bg-white" 
              : "bg-zinc-800 text-zinc-600"
          )}
        >
          <ArrowUp size={20} />
        </button>
      </div>
      
      {/* Session Metadata / Controls below composer */}
      <div className="flex items-center justify-between mt-2 px-2 text-xs">
        <div className="flex items-center gap-3">
          <ModelSelector />
          <div className="w-px h-4 bg-zinc-800"></div>
          <SkillSelector />
        </div>
      </div>
    </form>
  );
}
