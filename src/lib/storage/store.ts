import { create } from 'zustand';

interface WorkspaceState {
  // Active Selections
  activeProjectId: string | null;
  activeSessionId: string | null;
  
  // UI States
  isSidebarOpen: boolean;
  isThinkingPanelOpen: boolean;
  isRightPanelOpen: boolean;

  // Actions
  setActiveProject: (id: string | null) => void;
  setActiveSession: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleThinkingPanel: () => void;
  toggleRightPanel: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeProjectId: null,
  activeSessionId: null,

  isSidebarOpen: true,
  isThinkingPanelOpen: false,
  isRightPanelOpen: false,

  setActiveProject: (id) => set({ activeProjectId: id }),
  setActiveSession: (id) => set({ activeSessionId: id }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleThinkingPanel: () => set((state) => ({ isThinkingPanelOpen: !state.isThinkingPanelOpen })),
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),
}));
