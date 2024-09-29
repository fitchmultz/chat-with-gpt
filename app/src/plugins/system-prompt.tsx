import { FormattedMessage } from "react-intl";
import Plugin from "../core/plugins";
import { type PluginDescription } from "../core/plugins/plugin-description";
import { type OpenAIMessage, type Parameters } from "../core/chat/types";

export const defaultSystemPrompt = `
You are ChatGPT 4o, an advanced multimodal large language model.
Knowledge cutoff: 2023-10
Current date: {{ datetime }}
`.trim();

export interface SystemPromptPluginOptions {
  systemPrompt: string;
}

function isBetaModel(model: string): boolean {
  return [
    "o1-preview",
    "o1-preview-2024-09-12",
    "o1-mini",
    "o1-mini-2024-09-12",
  ].includes(model);
}

export class SystemPromptPlugin extends Plugin<SystemPromptPluginOptions> {
  describe(): PluginDescription {
    return {
      id: "system-prompt",
      name: "System Prompt",
      options: [
        {
          id: "systemPrompt",
          defaultValue: defaultSystemPrompt,
          displayOnSettingsScreen: "chat",
          resettable: true,
          scope: "chat",
          renderProps: {
            type: "textarea",
            description: (
              <p>
                <FormattedMessage
                  defaultMessage={
                    "The System Prompt is an invisible message inserted at the start of the chat and can be used to give ChatGPT information about itself and general guidelines for how it should respond. The <code>'{{ datetime }}'</code> tag is automatically replaced by the current date and time (use this to give the AI access to the time)."
                  }
                  values={{ code: (v) => <code>{v}</code> }}
                />
              </p>
            ),
          },
          displayInQuickSettings: {
            name: "System Prompt",
            displayByDefault: true,
            label: "Customize system prompt",
          },
        },
      ],
    };
  }

  async preprocessModelInput(
    messages: OpenAIMessage[],
    parameters: Parameters
  ): Promise<{ messages: OpenAIMessage[]; parameters: Parameters }> {
    if (isBetaModel(parameters.model)) {
      // For beta models, we need to incorporate the system prompt into the first user message
      const systemPrompt = (
        this.options?.systemPrompt || defaultSystemPrompt
      ).replace("{{ datetime }}", new Date().toLocaleString());

      const output = messages
        .map((message, index) => {
          if (index === 0 && message.role === "user") {
            return {
              ...message,
              content: `${systemPrompt}\n\nUser: ${message.content}`,
            };
          }
          return message;
        })
        .filter(
          (message) => message.role === "user" || message.role === "assistant"
        );

      // Adjust parameters for beta model limitations
      const betaParameters = {
        ...parameters,
        temperature: 1,
        top_p: 1,
        presence_penalty: 0,
        frequency_penalty: 0,
      };

      return {
        messages: output,
        parameters: betaParameters,
      };
    } else {
      // For non-beta models, use the original logic
      const output = [
        {
          role: "system",
          content: (this.options?.systemPrompt || defaultSystemPrompt).replace(
            "{{ datetime }}",
            new Date().toLocaleString()
          ),
        },
        ...messages,
      ];

      return {
        messages: output,
        parameters,
      };
    }
  }
}
