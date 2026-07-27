"use client";

import WorkspaceLayout from '@/components/layout/WorkspaceLayout';
import Sidebar from '@/components/layout/Sidebar';
import ChatArea from '@/components/chat/ChatArea';
import { useWorkspaceStore } from '@/lib/storage/store';
import { InboxIcon } from 'lucide-react';

export default function Home() {
  const { activeSessionId, activeProjectId } = useWorkspaceStore();

  return (
    <WorkspaceLayout sidebar={<Sidebar />}>
      <div className="flex-1 flex flex-col items-center justify-center h-full w-full bg-zinc-950/50">
        {!activeProjectId ? (
          <div className="flex flex-col items-center text-zinc-500 max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl">
              <InboxIcon size={24} className="text-zinc-400" />
            </div>
            <h2 className="text-xl font-medium text-zinc-300 mb-2">Welcome to Fyber</h2>
            <p className="text-sm text-zinc-500">Create a new project in the sidebar to begin your agent session.</p>
          </div>
        ) : !activeSessionId ? (
          <div className="flex flex-col items-center text-zinc-500 max-w-sm text-center">
            <h2 className="text-xl font-medium text-zinc-300 mb-2">Project Workspace</h2>
            <p className="text-sm text-zinc-500">Select or create a new session to start working with your agent.</p>
          </div>
        ) : (
          <div className="flex-1 w-full flex flex-col bg-zinc-950">
            <ChatArea />
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
