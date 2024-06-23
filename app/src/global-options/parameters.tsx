import { defaultModel as openAIDefaultModel } from "../core/chat/openai";
import { defaultModel as anthropicDefaultModel, anthropicModels } from "../core/chat/anthropic";
import { type OptionGroup } from "../core/options/option-group";
import { type RenderProps } from "../core/options/render-props";

export const parameterOptions: OptionGroup = {
  id: "parameters",
  options: [
    {
      id: "model",
      defaultValue: openAIDefaultModel,
      resettable: false,
      scope: "user",
      displayOnSettingsScreen: "chat",
      displayAsSeparateSection: true,
      displayInQuickSettings: {
        name: "Model",
        displayByDefault: true,
        label: (value) => value,
      },
      renderProps: (value, options, context): RenderProps => ({
        type: "select",
        label: "Model",
        description: getModelDescription(value, context),
        options: [
          { label: "--- OpenAI Models ---", value: "openai-header" },
          { label: "GPT-4o (latest)", value: "gpt-4o" },
          { label: "GPT-4 Turbo (latest)", value: "gpt-4-turbo" },
          { label: "GPT-4 Turbo 2024-04-09", value: "gpt-4-turbo-2024-04-09" },
          { label: "GPT-4 Turbo Preview (latest)", value: "gpt-4-turbo-preview" },
          { label: "GPT-4 Turbo 0125 Preview", value: "gpt-4-0125-preview" },
          { label: "GPT-4 Turbo 1106 Preview", value: "gpt-4-1106-preview" },
          { label: "GPT-4 Vision Preview", value: "gpt-4-vision-preview" },
          { label: "GPT-4 Classic", value: "gpt-4" },
          { label: "GPT-4 Classic 0613", value: "gpt-4-0613" },
          { label: "GPT-4 32k", value: "gpt-4-32k" },
          { label: "GPT-4 32k 0613", value: "gpt-4-32k-0613" },
          { label: "GPT-3.5 Turbo 0125", value: "gpt-3.5-turbo-0125" },
          { label: "GPT-3.5 Turbo 1106", value: "gpt-3.5-turbo-1106" },
          { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
          { label: "GPT-3.5 Turbo 16k", value: "gpt-3.5-turbo-16k" },
          { label: "GPT-3.5 Turbo Instruct", value: "gpt-3.5-turbo-instruct" },
          { label: "GPT-3.5 Turbo 0613", value: "gpt-3.5-turbo-0613" },
          { label: "GPT-3.5 Turbo 16k 0613", value: "gpt-3.5-turbo-16k-0613" },
          { label: "--- Anthropic Models ---", value: "anthropic-header" },
          ...anthropicModels.map(model => ({
            label: model,
            value: model,
          })),
        ],
      }),
    },
    {
      id: "temperature",
      defaultValue: 0.5,
      resettable: true,
      scope: "chat",
      displayOnSettingsScreen: "chat",
      displayAsSeparateSection: true,
      displayInQuickSettings: {
        name: "Temperature",
        displayByDefault: true,
        label: (value) => "Temperature: " + value.toFixed(1),
      },
      renderProps: (value, options, context) => ({
        type: "slider",
        label: "Temperature: " + value.toFixed(1),
        min: 0,
        max: 1,
        step: 0.1,
        description: context.intl.formatMessage({
          defaultMessage:
            "The temperature parameter controls the randomness of the AI's responses. Lower values will make the AI more predictable, while higher values will make it more creative.",
        }),
      }),
    },
    {
      id: "max_tokens",
      defaultValue: 4096,
      resettable: true,
      scope: "chat",
      displayOnSettingsScreen: "chat",
      displayAsSeparateSection: true,
      displayInQuickSettings: {
        name: "Max Tokens",
        displayByDefault: true,
        label: (value) => "Max Tokens: " + value,
      },
      renderProps: (value, options, context) => ({
        type: "number",
        label: "Max Tokens",
        min: 1,
        max: 200000,
        description: context.intl.formatMessage({
          defaultMessage:
            "The maximum number of tokens to generate in the response. Maximum value is 200,000 for Anthropic models, but may vary for OpenAI models.",
        }),
      }),
    },
  ],
};

function getModelDescription(value: string, context: any) {
  if (value.startsWith("gpt-")) {
    return value.includes("32")
      ? context.intl.formatMessage(
          {
            defaultMessage:
              "Note: This model will only work if your OpenAI account has been granted access to it. <a>Request access here.</a>",
          },
          {
            a: (text: string) => (
              <a
                href="https://openai.com/waitlist/gpt-4-api"
                target="_blank"
                rel="noreferer noreferrer"
              >
                {text}
              </a>
            ),
          } as any
        )
      : "";
  } else if (value.startsWith("claude-")) {
    return context.intl.formatMessage({
      defaultMessage:
        "Anthropic's Claude models offer advanced language understanding and generation capabilities.",
    });
  }
  return "";
}