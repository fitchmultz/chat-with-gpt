import Anthropic from "@anthropic-ai/sdk";
import { config } from '../../../config';
import { Message, Parameters, getOpenAIMessageFromMessage } from '../../../core/chat/types';

export async function sendMessage(messages: Message[], parameters: Parameters): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: parameters.apiKey || config.services?.anthropic?.apiKey,
  });

  const anthropicMessages = messages.map(message => ({
    role: message.role,
    content: message.content
  }));

  try {
    const response = await anthropic.messages.create({
      model: parameters.model,
      max_tokens: 1000, // You may want to make this configurable
      temperature: parameters.temperature,
      system: parameters.initialSystemPrompt || "You are a helpful assistant.",
      messages: anthropicMessages,
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Error sending message to Anthropic:', error);
    throw error;
  }
}