import { db } from '@/lib/storage/dexie';

export class AgentMemory {
  static async fetchSessionContext(sessionId: string, limit: number = 20) {
    // Retrieve recent messages for the current session
    const messages = await db.messages
      .where('sessionId')
      .equals(sessionId)
      .reverse()
      .limit(limit)
      .toArray();
      
    // Sort chronologically
    return messages.reverse();
  }

  static async fetchWorkspaceContext(projectId: string) {
    // Retrieve any pinned documents, summaries, or metadata associated with the project
    const project = await db.projects.get(projectId);
    return {
      projectName: project?.name,
      // Further contextual data
    };
  }
}
