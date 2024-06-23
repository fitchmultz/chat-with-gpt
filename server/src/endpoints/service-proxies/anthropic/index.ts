import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/messages', async (req, res) => {
  const anthropicApiKey = req.headers['x-anthropic-api-key'];
  
  if (!anthropicApiKey) {
    return res.status(400).json({ error: 'Anthropic API key is required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey as string,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error proxying request to Anthropic:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

export default router;