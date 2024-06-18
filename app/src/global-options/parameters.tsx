import { defaultModel } from "../core/chat/openai";
import { type OptionGroup } from "../core/options/option-group";

export const parameterOptions: OptionGroup = {
  id: "parameters",
  options: [
    {
      id: "model",
      defaultValue: defaultModel,
      resettable: false,
      scope: "user",
      displayOnSettingsScreen: "chat",
      displayAsSeparateSection: true,
      displayInQuickSettings: {
        name: "Model",
        displayByDefault: true,
        label: (value) => value,
      },
      renderProps: (value, options, context) => ({
        type: "select",
        label: "Model",
        description:
          value?.includes("32") &&
          context.intl.formatMessage(
            {
              defaultMessage:
                "Note: This model will only work if your OpenAI account has been granted you have been given access to it. <a>Request access here.</a>",
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
          ),
        options: [
          {
            label: "GPT-4o (latest)",
            value: "gpt-4o",
          },
          {
            label: "GPT-4 Turbo (latest)",
            value: "gpt-4-turbo",
          },
          {
            label: "GPT-4 Turbo 2024-04-09",
            value: "gpt-4-turbo-2024-04-09",
          },
          {
            label: "GPT-4 Turbo Preview (latest)",
            value: "gpt-4-turbo-preview",
          },
          {
            label: "GPT-4 Turbo 0125 Preview",
            value: "gpt-4-0125-preview",
          },
          {
            label: "GPT-4 Turbo 1106 Preview",
            value: "gpt-4-1106-preview",
          },
          {
            label: "GPT-4 Vision Preview",
            value: "gpt-4-vision-preview",
          },
          {
            label: "GPT-4 Classic",
            value: "gpt-4",
          },
          {
            label: "GPT-4 Classic 0613",
            value: "gpt-4-0613",
          },
          {
            label: "GPT-4 32k",
            value: "gpt-4-32k",
          },
          {
            label: "GPT-4 32k 0613",
            value: "gpt-4-32k-0613",
          },
          {
            label: "GPT-3.5 Turbo 0125",
            value: "gpt-3.5-turbo-0125",
          },
          {
            label: "GPT-3.5 Turbo 1106",
            value: "gpt-3.5-turbo-1106",
          },
          {
            label: "GPT-3.5 Turbo",
            value: "gpt-3.5-turbo",
          },
          {
            label: "GPT-3.5 Turbo 16k",
            value: "gpt-3.5-turbo-16k",
          },
          {
            label: "GPT-3.5 Turbo Instruct",
            value: "gpt-3.5-turbo-instruct",
          },
          {
            label: "GPT-3.5 Turbo 0613",
            value: "gpt-3.5-turbo-0613",
          },
          {
            label: "GPT-3.5 Turbo 16k 0613",
            value: "gpt-3.5-turbo-16k-0613",
          },
        ],
      }),
    },
    {
      id: "temperature",
      defaultValue: 0.7,
      resettable: true,
      scope: "chat",
      displayOnSettingsScreen: "chat",
      displayAsSeparateSection: true,
      displayInQuickSettings: {
        name: "Temperature",
        displayByDefault: true,
        label: (value) => "Temperature: " + value.toFixed(2),
      },
      renderProps: (value, options, context) => ({
        type: "slider",
        label: "Temperature: " + value.toFixed(2),
        min: 0,
        max: 1,
        step: 0.1,
        description: context.intl.formatMessage({
          defaultMessage:
            "The temperature parameter controls the randomness of the AI's responses. Lower values will make the AI more predictable, while higher values will make it more creative.",
        }),
      }),
    },
  ],
};
