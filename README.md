# Chat with GPT

Chat with GPT is an open-source ChatGPT app with extra features and more ways to customize your API experience. It interacts with the ChatGPT API and supports ElevenLabs to give ChatGPT a voice.

This is a fork of [cogent-apps](https://github.com/cogentapps/chat-with-gpt) that is no longer maintained.

I have kept this updated with the latest 01-preview models as of September 29, 2024.

I am attempting to keep all packages and dependencies updated to the most recent version for security and compatibility.

You can [self-host with Docker](#running-on-your-own-computer).

You can build your own image, or use the images I've built and [hosted in my public registry](https://ghcr.io/fitchmultz/chat-with-gpt:latest). Builds for x64 and arm64 are combined into 1 image.

Powered by the ChatGPT API from OpenAI, this app has been developed using TypeScript + React. I welcome pull requests from the community.
https://user-images.githubusercontent.com/127109874/223613258-0c4fef2e-1d05-43a1-ac38-e972dafc2f98.mp4

## Features

- 🚀 **Fast** streaming response times.
- 🔎 **Search** through your past chat conversations.
- 📄 View and customize the System Prompt - the **secret prompt** the system shows the AI before your messages.
- 🌡 Adjust the **creativity and randomness** of responses by setting the Temperature setting. Higher temperature means more creativity.
- 💬 Give ChatGPT AI a **human voice** by connecting your ElevenLabs text-to-speech account, or using your browser's built-in text-to-speech.
- 🎤 **Speech recognition** powered by OpenAI Whisper.
- :muscle: **Latest models** that are kept up-to-date with the releases from OpenAI.
- :camera: **Image** capabilities, so you can query GPT-4V about your pictures.
- ✉ **Share** your favorite chat sessions online using public share URLs.
- 📋 Easily **copy-and-paste** ChatGPT messages.
- ✏️ Edit your messages
- 🔁 Regenerate ChatGPT messages
- 🖼 **Full markdown support** including code, tables, and math.
- 🫰 Pay for only what you use with the ChatGPT API.

## Bring your own API keys

### OpenAI

To get started, you will need to add your OpenAI API key on the settings screen. Click "Connect your OpenAI account to get started" on the home page to begin. Once you have added your API key, you can start chatting.

Your API key is stored only on your device and is never transmitted to anyone except OpenAI. Please note that OpenAI API key usage is billed at a pay-as-you-go rate based on token usage, separate from your ChatGPT subscription. More tokens equals higher cost.

### ElevenLabs

To use the AI text-to-speech feature, add your ElevenLabs API key by clicking "Play" next to any message.

Your API key is stored only on your device and never transmitted to anyone except ElevenLabs.

## Running on your own computer

To run on your own device, you can use Docker. Run the docker command in a directory that you want to store your history.

```
docker run -v $(pwd)/data:/app/data -p 3000:3000 ghcr.io/fitchmultz/chat-with-gpt:latest
```

Then navigate to http://localhost:3000 to view the app.

### Store your API keys on the server

For convenience, you can store your API keys on your computer instead of entering them in the browser.

_Warning:_ Be careful doing this because anyone with access to your interface will be able to use your API key.

Create a file called `config.yaml` in your `data` folder with the following contents. The `data` dirextory is created after running the container for the first time:

```
services:
  openai:
    apiKey: (your api key)
  elevenlabs:
    apiKey: (your api key)
```

and restart the server. Login is required.

## Updating

```
docker pull ghcr.io/fitchmultz/chat-with-gpt:latest
```

## TODOs

- [ ] Save system prompt between browsers for a user.
- [ ] Add support for Anthropic API models
- [ ] Support for Assistants.
- [ ] Change API key field so it's not auto-filled by password managers with password
- [ ] Fix importing chats
- [ ] Fix incompatibility with iPhone. Apple imposes limits on JavaScript execution which are incompatibility with how the app functions. Not sure if this can be fixed without a complete rewrite.

## Support

I am one dude with a full time job but I'll try to provide whatever support I can.

## License

Chat with GPT is licensed under the MIT license. See the LICENSE file for more information.
