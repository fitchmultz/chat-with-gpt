import { FormattedMessage } from 'react-intl'
import { type OptionGroup } from '../core/options/option-group'

export const anthropicOptions: OptionGroup = {
  id: 'anthropic',
  options: [
    {
      id: 'apiKey',
      defaultValue: '',
      displayOnSettingsScreen: 'user',
      displayAsSeparateSection: true,
      renderProps: () => ({
        type: 'password',
        label: 'Your Anthropic API Key',
        placeholder: 'sk-ant-api03-***********************',
        description: <>
          <p>
            <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer">
              <FormattedMessage defaultMessage="Find your API key here." description="Label for the link that takes the user to the Anthropic console where they can find their API key." />
            </a>
          </p>
          <p>
            <FormattedMessage defaultMessage="Your API key is stored only on this device and never transmitted to anyone except Anthropic." />
          </p>
          <p>
            <FormattedMessage defaultMessage="Anthropic API key usage is billed at a pay-as-you-go rate." />
          </p>
        </>
      })
    }
  ]
}