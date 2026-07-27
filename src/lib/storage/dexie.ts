import Dexie, { Table } from 'dexie';

export interface Project {
  id: string;
  name: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  color?: string;
  icon?: string;
  order: number;
}

export interface Session {
  id: string;
  projectId: string;
  name: string;
  pinned: boolean;
  modelId: string;
  provider: string;
  thinkingLevel: 'Off' | 'Medium' | 'High' | 'XHigh' | 'Max';
  skillsEnabled: string[]; // e.g. ['code-writer', 'vision']
  createdAt: number;
  updatedAt: number;
  branchParentId?: string;
  lastMessageAt: number;
  activeTaskId?: string;
  executionState?: 'idle' | 'planning' | 'running_tools' | 'waiting_approval' | 'completed' | 'failed';
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  args: any;
  status: 'pending' | 'success' | 'error';
  result?: any;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  reasoningSummary?: string;
  provider?: string;
  modelId?: string;
  createdAt: number;
  attachments?: Attachment[];
  status: 'streaming' | 'completed' | 'error';
  toolCalls?: ToolCall[];
  planStep?: string;
  isBranchPoint?: boolean;
}

export class FyberDatabase extends Dexie {
  projects!: Table<Project, string>;
  sessions!: Table<Session, string>;
  messages!: Table<Message, string>;

  constructor() {
    super('FyberDatabase');
    this.version(1).stores({
      projects: 'id, createdAt, updatedAt, order',
      sessions: 'id, projectId, lastMessageAt, createdAt',
      messages: 'id, sessionId, createdAt'
    });
  }
}

export const db = new FyberDatabase();
