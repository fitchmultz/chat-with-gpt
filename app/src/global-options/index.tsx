import { pluginMetadata } from '../core/plugins/metadata'
import { type Option } from '../core/options/option'
import { type OptionGroup } from '../core/options/option-group'
import { openAIOptions } from './openai'
import { anthropicOptions } from './anthropic'
import { parameterOptions } from './parameters'
import { ttsServiceOptions } from './tts-service'
import { autoScrollOptions, inputOptions, markdownOptions } from './ui'
import { whisperOptions } from './whisper'

export const globalOptions: OptionGroup[] = [
  openAIOptions,
  anthropicOptions,
  autoScrollOptions,
  parameterOptions,
  inputOptions,
  markdownOptions,
  whisperOptions,
  ttsServiceOptions
]

const optionsForQuickSettings: Option[] = [];
[...globalOptions, ...pluginMetadata].forEach(plugin => {
  plugin.options.forEach(option => {
    if (option.displayInQuickSettings) {
      optionsForQuickSettings.push({
        id: plugin.id + '--' + option.id,
        defaultValue: !!((option.displayInQuickSettings?.displayByDefault) ?? false),
        displayOnSettingsScreen: 'ui',
        displayAsSeparateSection: false,
        renderProps: {
          type: 'checkbox',
          label: option.displayInQuickSettings?.name || option.id
        }
      })
    }
  })
})

export const quickSettings: OptionGroup = {
  id: 'quick-settings',
  name: 'Quick Settings',
  options: optionsForQuickSettings
}

globalOptions.push(quickSettings)