import EventEmitter from "events";
import OpenAI from "openai";
import SSE from "../utils/sse";
import { type OpenAIMessage, type Parameters } from "./types";
import { backend } from "../backend";

export const defaultModel = "chatgpt-4o-latest";
export const titlesModel = "chatgpt-4o-latest";

export function isProxySupported() {
  return !!backend.current?.services?.includes("openai");
}

function shouldUseProxy(apiKey: string | undefined | null) {
  return !apiKey && isProxySupported();
}

function getEndpoint(proxied = false) {
  return proxied ? "/chatapi/proxies/openai" : "https://api.openai.com";
}

export interface OpenAIResponseChunk {
  id?: string;
  done: boolean;
  choices?: Array<{
    delta: {
      content: string;
    };
    index: number;
    finish_reason: string | null;
  }>;
  model?: string;
}

function parseResponseChunk(buffer: string): OpenAIResponseChunk[] {
  const chunk = buffer.replace("data: ", "").trim();

  if (chunk === "[DONE]") {
    return [{ done: true }];
  }

  try {
    const parsed = JSON.parse(chunk);
    return [
      {
        id: parsed.id,
        done: false,
        choices: parsed.choices,
        model: parsed.model,
      },
    ];
  } catch (e) {
    try {
      const modifiedChunk = "[" + chunk.replace(/}\s*{/g, "},{") + "]";
      const parsedArray = JSON.parse(modifiedChunk);
      return parsedArray.map((parsed: any) => ({
        id: parsed.id,
        done: false,
        choices: parsed.choices,
        model: parsed.model,
      }));
    } catch (error) {
      console.error("Error parsing modified JSON:", error);
      return [{ done: true }];
    }
  }
}

function isBetaModel(model: string): boolean {
  return [
    "o1-preview",
    "o1-preview-2024-09-12",
    "o1-mini",
    "o1-mini-2024-09-12",
  ].includes(model);
}

export async function createChatCompletion(
  messages: OpenAIMessage[],
  parameters: Parameters
): Promise<string> {
  const proxied = shouldUseProxy(parameters.apiKey);
  const endpoint = getEndpoint(proxied);

  if (!proxied && !parameters.apiKey) {
    throw new Error("No API key provided");
  }

  const payload: any = isBetaModel(parameters.model)
    ? {
        model: parameters.model,
        messages: messages.map(({ role, content, beta }) => ({ 
          role, 
          content: beta ? JSON.stringify(content) : content 
        })),
      }
    : {
        model: parameters.model,
        messages,
        temperature: parameters.temperature,
      };

  if (parameters.model === "gpt-4-vision-preview") {
    payload.max_completion_tokens = 4096;
  }

  const response = await fetch(endpoint + "/v1/chat/completions", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      Authorization: !proxied ? `Bearer ${parameters.apiKey}` : "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  return data.choices[0].message?.content?.trim() || "";
}

export async function createStreamingChatCompletion(
  messages: OpenAIMessage[],
  parameters: Parameters
) {
  if (isBetaModel(parameters.model)) {
    const response = await createChatCompletion(messages, parameters);
    const emitter = new EventEmitter();
    setTimeout(() => {
      emitter.emit("data", response);
      emitter.emit("done");
    }, 0);
    return {
      emitter,
      cancel: () => {},
    };
  }
  const emitter = new EventEmitter();

  const proxied = shouldUseProxy(parameters.apiKey);
  const endpoint = getEndpoint(proxied);

  if (!proxied && !parameters.apiKey) {
    throw new Error("No API key provided");
  }

  const payload: any = {
    model: parameters.model,
    messages,
    temperature: parameters.temperature,
    stream: true,
  };

  if (parameters.model === "gpt-4-vision-preview") {
    payload.max_completion_tokens = 4096;
  }

  const eventSource = new SSE(endpoint + "/v1/chat/completions", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      Authorization: !proxied ? `Bearer ${parameters.apiKey}` : "",
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(payload),
  });

  let contents = "";

  eventSource.addEventListener("error", (event: any) => {
    if (!contents) {
      let error = event.data;
      try {
        error = JSON.parse(error).error.message;
      } catch (e) {}
      emitter.emit("error", error);
    }
  });

  eventSource.addEventListener("message", async (event: any) => {
    if (event.data === "[DONE]") {
      emitter.emit("done");
      return;
    }

    try {
      const chunks = parseResponseChunk(event.data);
      chunks.forEach((chunk) => {
        if (chunk.choices && chunk.choices.length > 0) {
          contents += chunk.choices[0]?.delta?.content || "";
        }
      });
      emitter.emit("data", contents);
    } catch (e) {
      console.error(e);
    }
  });

  eventSource.stream();

  return {
    emitter,
    cancel: () => {
      eventSource.close();
    },
  };
}

export const maxCompletionTokensByModel = {
  "o1-preview": 128000,
  "o1-preview-2024-09-12": 128000,
  "o1-mini": 128000,
  "o1-mini-2024-09-12": 128000,
  "gpt-4o": 128000,
  "gpt-4o-2024-05-13": 128000,
  "gpt-4o-2024-08-06": 128000,
  "chatgpt-4o-latest": 128000,
  "gpt-4o-mini": 128000,
  "gpt-4o-mini-2024-07-18": 128000,
  "gpt-4-turbo": 128000,
  "gpt-4-turbo-2024-04-09": 128000,
  "gpt-4-turbo-preview": 128000,
  "gpt-4-0125-preview": 128000,
  "gpt-4-1106-preview": 128000,
  "gpt-4": 8192,
  "gpt-4-0613": 8192,
  "gpt-3.5-turbo-0125": 16385,
  "gpt-3.5-turbo": 16385,
  "gpt-3.5-turbo-1106": 16385,
  "gpt-3.5-turbo-16k": 16385,
  "gpt-3.5-turbo-instruct": 4096,
};
