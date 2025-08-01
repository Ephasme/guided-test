export function createRetryPromptBuilder(
  basePromptBuilder: () => string,
  allowNull: boolean = false
) {
  return (attempt: number, previousError?: string) => {
    const basePrompt = basePromptBuilder();

    if (attempt === 1) {
      return basePrompt;
    }

    const nullText = allowNull ? " or 'null'" : "";
    const retryPrefixes = [
      `⚠️ CRITICAL: You must respond with ONLY valid JSON${nullText}. No explanations, no markdown formatting, no code blocks.`,
      `🚨 URGENT: Return ONLY a valid JSON object${nullText}. Do not include any text before or after the JSON.`,
      `💥 FINAL WARNING: Your response must be pure JSON only${nullText}. No \`\`\`json\`\`\` blocks, no explanations, no extra text.`,
    ];

    const retryPrefix =
      retryPrefixes[Math.min(attempt - 2, retryPrefixes.length - 1)];

    let enhancedPrompt = `${retryPrefix}\n\n`;

    if (previousError) {
      enhancedPrompt += `Previous response was invalid: "${previousError}"\n\n`;
    }

    enhancedPrompt += basePrompt;

    return enhancedPrompt;
  };
}
