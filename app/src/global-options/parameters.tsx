import { defaultModel } from '../core/chat/openai'
import { type OptionGroup } from '../core/options/option-group'

export const parameterOptions: OptionGroup = {
  id: 'parameters',
  options: [
    {
      id: 'model',
      defaultValue: defaultModel,
      resettable: false,
      scope: 'user',
      displayOnSettingsScreen: 'chat',
      displayAsSeparateSection: true,
      displayInQuickSettings: {
        name: 'Model',
        displayByDefault: true,
        label: (value) => value
      },
      renderProps: (value, options, context) => ({
        type: 'select',
        label: 'Model',
        description: value?.includes('32') && context.intl.formatMessage(
          {
            defaultMessage: 'Note: This model will only work if your OpenAI account has been granted you have been given access to it. <a>Request access here.</a>'
          },
          {
            a: (text: string) => <a href="https://openai.com/waitlist/gpt-4-api" target="_blank" rel="noreferer noreferrer">{text}</a>
          } as any
        ),
        options: [
          {
            label: 'GPT-3.5 Turbo',
            value: 'gpt-3.5-turbo'
          },
          {
            label: 'Fine Tuned GPT-3.5 Turbo Tanium',
            value: 'ft:gpt-3.5-turbo-1106:linkfultz::8irSJZ4G'
          },
          {
            label: 'GPT-3.5 Turbo Snapshot (November 6, 2023)',
            value: 'gpt-3.5-turbo-1106'
          },
          {
            label: 'GPT-3.5 Turbo 16k',
            value: 'gpt-3.5-turbo-16k'
          },
          {
            label: 'GPT-4 Snapshot 128k',
            value: 'gpt-4-1106-preview'
          },
          {
            label: 'GPT-4V (GPT-4 with Vision)',
            value: 'gpt-4-vision-preview'
          },
          {
            label: 'GPT-4',
            value: 'gpt-4'
          },
          {
            label: 'GPT-4 32k',
            value: 'gpt-4-32k'
          }
        ]
      })
    },
    {
      id: 'temperature',
      defaultValue: 0.5,
      resettable: true,
      scope: 'chat',
      displayOnSettingsScreen: 'chat',
      displayAsSeparateSection: true,
      displayInQuickSettings: {
        name: 'Temperature',
        displayByDefault: true,
        label: (value) => 'Temperature: ' + value.toFixed(1)
      },
      renderProps: (value, options, context) => ({
        type: 'slider',
        label: 'Temperature: ' + value.toFixed(1),
        min: 0,
        max: 1,
        step: 0.1,
        description: context.intl.formatMessage({ defaultMessage: "The temperature parameter controls the randomness of the AI's responses. Lower values will make the AI more predictable, while higher values will make it more creative." })
      })
    }
  ]
}
