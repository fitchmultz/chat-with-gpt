import EventEmitter from 'events'
import { AnthropicMessage, Parameters } from './types'

export const defaultModel = 'claude-3-opus-20240229'

export const anthropicModels = [
  'claude-3-5-sonnet-20240620',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307'
]

export function isAnthropicModel(model: string): boolean {
  return anthropicModels.includes(model)
}

export async function createChatCompletion(messages: AnthropicMessage[], parameters: Parameters): Promise<string> {
  const response = await fetch('/api/anthropic/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-anthropic-api-key': parameters.anthropicApiKey || '',
    },
    body: JSON.stringify({
      model: parameters.model,
      messages: messages,
      max_tokens: parameters.max_tokens,
      temperature: parameters.temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function createStreamingChatCompletion(messages: AnthropicMessage[], parameters: Parameters) {
  const emitter = new EventEmitter()

  const response = await fetch('/api/anthropic/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-anthropic-api-key': parameters.anthropicApiKey || '',
    },
    body: JSON.stringify({
      model: parameters.model,
      messages: messages,
      max_tokens: parameters.max_tokens,
      temperature: parameters.temperature,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  let content = '';

  const read = async () => {
    if (reader) {
      const { done, value } = await reader.read();
      if (done) {
        emitter.emit('done');
        return;
      }

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'content_block_delta' && data.delta.type === 'text_delta') {
            content += data.delta.text;
            emitter.emit('data', content);
          }
        }
      }

      read();
    }
  };

  read();

  return {
    emitter,
    cancel: () => { reader?.cancel(); }
  }
}

export const maxTokensByModel = {
  'claude-3-5-sonnet-20240620': 200000,
  'claude-3-opus-20240229': 200000,
  'claude-3-sonnet-20240229': 200000,
  'claude-3-haiku-20240307': 200000,
}