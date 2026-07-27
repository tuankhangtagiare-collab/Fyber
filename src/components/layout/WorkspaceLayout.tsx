import React from 'react';
import { useWorkspaceStore } from '@/lib/storage/store';
import { cn } from '@/lib/utils';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import CommandPalette from './CommandPalette';

export default function WorkspaceLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isSidebarOpen, toggleSidebar } = useWorkspaceStore();

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-50 overflow-hidden">
      <CommandPalette />
      
      {/* Sidebar */}
      <div
        className={cn(
          "flex-shrink-0 border-r border-zinc-800 bg-zinc-900/50 transition-all duration-300 ease-in-out flex flex-col",
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden border-none"
        )}
      >
        <div className="w-64 h-full flex flex-col">{sidebar}</div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-14 border-b border-zinc-800 flex items-center px-4 shrink-0 absolute top-0 w-full z-10 bg-zinc-950/80 backdrop-blur-md">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
          
          {/* We will inject session headers here later */}
        </header>

        <main className="flex-1 overflow-hidden pt-14 flex">
          {children}
        </main>
      </div>
    </div>
  );
}
