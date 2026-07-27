export interface ToolSchema {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface AgentTool {
  schema: ToolSchema;
  execute: (args: any, context: any) => Promise<any>;
  requiresApproval: boolean;
}

export class ToolRegistry {
  private tools: Map<string, AgentTool> = new Map();

  registerTool(tool: AgentTool) {
    this.tools.set(tool.schema.name, tool);
  }

  getTool(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  getAvailableTools(skills: string[]): AgentTool[] {
    // Filter tools based on active skills in the session
    // For example, only return 'run_code' if 'code-writer' skill is active.
    return Array.from(this.tools.values());
  }
}

export const globalToolRegistry = new ToolRegistry();

// Example Tool Registration
globalToolRegistry.registerTool({
  schema: {
    name: 'fetch_web_content',
    description: 'Fetches content from a URL',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string' }
      },
      required: ['url']
    }
  },
  requiresApproval: false,
  execute: async (args) => {
    // Logic to fetch URL
    return { content: 'mock content' };
  }
});
