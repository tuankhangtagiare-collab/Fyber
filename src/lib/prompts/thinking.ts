export type ThinkingLevel = 'Off' | 'Medium' | 'High' | 'XHigh' | 'Max';

export const THINKING_PROMPTS: Record<ThinkingLevel, string> = {
  Off: "You are in Thinking Off mode. Respond directly and efficiently. Keep the answer concise when possible. Avoid extended reasoning unless necessary for correctness. Do not reveal hidden chain-of-thought. Provide only the useful answer the user needs.",
  Medium: "You are in Thinking Medium mode. Analyze the request carefully, identify key constraints, verify important details, and answer clearly. Use moderate reasoning depth. Do not reveal hidden chain-of-thought. Provide a concise reasoning summary only if it helps the user understand the answer.",
  High: "You are in Thinking High mode. Perform deep analysis, consider alternatives, check edge cases, and verify important details before answering. Keep the final response accurate, structured, and useful. Do not reveal hidden chain-of-thought. Provide a concise reasoning summary only if useful.",
  XHigh: "You are in Thinking XHigh mode. Conduct a highly careful analysis with stronger decomposition of the task, more rigorous checking, and more explicit constraint management. Evaluate edge cases and avoid shallow assumptions. Do not reveal hidden chain-of-thought. Provide a compact reasoning summary and a reliable final answer.",
  Max: "You are in Thinking Max mode. Perform the deepest and most rigorous analysis available. Break the problem into subproblems, compare approaches, test assumptions, verify edge cases, and prioritize correctness above brevity. Do not reveal hidden chain-of-thought. Produce only a safe reasoning summary and the final answer."
};

export function getSystemPrompt(thinkingLevel: ThinkingLevel, skills: string[]): string {
  let prompt = THINKING_PROMPTS[thinkingLevel] + "\n\n";

  if (skills.includes('code-writer')) {
    prompt += "You are an expert software engineer. Provide complete, working code. Explain key decisions.\n";
  }
  if (skills.includes('vision')) {
    prompt += "You have vision capabilities. Analyze images thoroughly and describe visual details.\n";
  }
  
  // Add more skill behaviors as needed
  
  prompt += "\nYou have access to tools. Use them when necessary to fulfill the user's request.";

  return prompt;
}
