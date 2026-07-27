"use client";

import React from 'react';
import { useWorkspaceStore } from '@/lib/storage/store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/storage/dexie';
import Composer from '../composer/Composer';
import ThinkingPanel from '../thinking/ThinkingPanel';
import { useAgentLoop } from '@/lib/agent/loop';
import { GitBranch } from 'lucide-react';

export default function ChatArea() {
  const { activeSessionId, setActiveSession } = useWorkspaceStore();
  
  // Activate the Agent Loop for the current session
  useAgentLoop();
  
  const messages = useLiveQuery(
    () => activeSessionId ? db.messages.where('sessionId').equals(activeSessionId).sortBy('createdAt') : [],
    [activeSessionId]
  );
  
  const session = useLiveQuery(
    () => activeSessionId ? db.sessions.get(activeSessionId) : undefined,
    [activeSessionId]
  );

  if (!activeSessionId) {
    return <div className="flex-1 flex items-center justify-center text-zinc-500">No session selected.</div>;
  }

  const handleBranch = async (msgId: string, timestamp: number) => {
     if (!session) return;
     const newSessionId = crypto.randomUUID();
     await db.sessions.add({
        ...session,
        id: newSessionId,
        name: `${session.name} (Branch)`,
        branchParentId: session.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
     });

     const messagesToBranch = messages ? messages.filter(m => m.createdAt <= timestamp) : [];
     const clonedMessages = messagesToBranch.map(m => ({
        ...m,
        id: crypto.randomUUID(),
        sessionId: newSessionId,
     }));
     
     if (clonedMessages.length > 0) {
        await db.messages.bulkAdd(clonedMessages);
     }
     
     setActiveSession(newSessionId);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 relative">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages?.map((msg) => (
          <div key={msg.id} className={`group flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} relative`}>
            
            {/* Branch Button */}
            <div className={`absolute top-2 ${msg.role === 'user' ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-opacity`}>
               <button onClick={() => handleBranch(msg.id, msg.createdAt)} title="Branch from here" className="p-1.5 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-400 hover:text-zinc-100">
                  <GitBranch size={14} />
               </button>
            </div>

            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-zinc-800 text-zinc-100 rounded-br-sm' 
                : 'bg-zinc-900 border border-zinc-800/60 text-zinc-300 rounded-bl-sm'
            }`}>
              {/* Agent Thinking Box inside Assistant Message */}
              {msg.role === 'assistant' && msg.reasoningSummary && (
                <ThinkingPanel reasoning={msg.reasoningSummary} />
              )}
              
              <div className="prose prose-invert max-w-none text-sm">
                {msg.content}
              </div>
              
              {/* Tool Execution Timeline visualization */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-800/50 flex flex-col gap-2">
                  {msg.toolCalls.map(tool => (
                    <div key={tool.id} className="text-xs flex items-center gap-2 bg-zinc-950/50 px-2 py-1.5 rounded border border-zinc-800/30">
                      <div className={`w-2 h-2 rounded-full ${tool.status === 'success' ? 'bg-green-500' : tool.status === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
                      <span className="font-mono text-zinc-400">{tool.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Composer Area */}
      <div className="p-4 shrink-0 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-10">
        <div className="max-w-4xl mx-auto">
          <Composer sessionId={activeSessionId} sessionProvider={session?.provider} />
        </div>
      </div>
    </div>
  );
}
