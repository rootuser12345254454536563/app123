import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory / audit store for WhatsApp webhook events & status logs
interface MessageLog {
  id: string;
  phone: string;
  type: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  payload?: any;
  error?: string;
}

const messageLogs: MessageLog[] = [];

// 1. WhatsApp Cloud API Status check
app.get('/api/whatsapp/status', (_req: Request, res: Response) => {
  const isConfigured = Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID
  );

  res.json({
    configured: isConfigured,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID
      ? `${process.env.WHATSAPP_PHONE_NUMBER_ID.slice(0, 4)}...${process.env.WHATSAPP_PHONE_NUMBER_ID.slice(-4)}`
      : null,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ? 'Configured' : 'Not configured',
    verifyTokenSet: Boolean(process.env.WHATSAPP_VERIFY_TOKEN),
    recentLogsCount: messageLogs.length,
    instructions: !isConfigured
      ? 'To send live WhatsApp messages, configure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in your environment variables.'
      : 'WhatsApp Cloud API is active.'
  });
});

// 2. WhatsApp Webhook Verification (Meta standard)
app.get('/api/whatsapp/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'buyjump_webhook_verify_token_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp Webhook verified successfully by Meta.');
    res.status(200).send(challenge);
  } else {
    console.warn('WhatsApp Webhook verification failed. Token mismatch.');
    res.sendStatus(403);
  }
});

// 3. WhatsApp Webhook Receipt (Status updates & incoming messages)
app.post('/api/whatsapp/webhook', (req: Request, res: Response) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    if (body.entry && body.entry[0]?.changes && body.entry[0].changes[0]?.value) {
      const changeValue = body.entry[0].changes[0].value;

      // Handle delivery status updates
      if (changeValue.statuses && changeValue.statuses[0]) {
        const statusObj = changeValue.statuses[0];
        const msgId = statusObj.id;
        const status = statusObj.status; // sent, delivered, read, failed

        console.log(`[WhatsApp Webhook] Message ${msgId} status: ${status}`);

        const existing = messageLogs.find(m => m.id === msgId);
        if (existing) {
          existing.status = status;
        } else {
          messageLogs.unshift({
            id: msgId,
            phone: statusObj.recipient_id || 'unknown',
            type: 'status_update',
            status: status as any,
            timestamp: new Date().toISOString(),
            payload: statusObj
          });
        }
      }

      // Handle incoming customer messages
      if (changeValue.messages && changeValue.messages[0]) {
        const msg = changeValue.messages[0];
        console.log(`[WhatsApp Webhook] Incoming message from ${msg.from}:`, msg.text?.body || msg.type);

        messageLogs.unshift({
          id: msg.id,
          phone: msg.from,
          type: 'incoming_message',
          status: 'delivered',
          timestamp: new Date().toISOString(),
          payload: msg
        });
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// 4. Send WhatsApp Notification (via Meta Cloud API)
app.post('/api/whatsapp/send', async (req: Request, res: Response) => {
  const { to, type, templateName, parameters, textMessage, orderId } = req.body;

  if (!to) {
    return res.status(400).json({ error: 'Recipient phone number is required' });
  }

  const cleanPhone = String(to).replace(/[^0-9]/g, '');
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const logEntry: MessageLog = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    phone: cleanPhone,
    type: type || 'order_update',
    status: 'queued',
    timestamp: new Date().toISOString(),
    payload: { orderId, templateName, textMessage }
  };

  // If live credentials are not set up in environment, provide clear informative status
  if (!accessToken || !phoneNumberId) {
    logEntry.status = 'queued';
    logEntry.error = 'Live Meta WhatsApp Cloud API credentials (WHATSAPP_ACCESS_TOKEN & WHATSAPP_PHONE_NUMBER_ID) not yet configured.';
    messageLogs.unshift(logEntry);

    return res.status(200).json({
      success: true,
      deliveredSimulated: true,
      messageId: logEntry.id,
      note: 'Message queued and logged in BUYJUMP. Live Meta WhatsApp dispatch requires WHATSAPP_ACCESS_TOKEN in env.',
      recipient: cleanPhone
    });
  }

  try {
    const metaUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

    let payload: any;
    if (type === 'template') {
      payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName || 'order_confirmation',
          language: { code: 'en_US' },
          components: parameters || []
        }
      };
    } else {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: { preview_url: true, body: textMessage }
      };
    }

    const response = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      logEntry.status = 'failed';
      logEntry.error = data.error?.message || 'Meta API request failed';
      messageLogs.unshift(logEntry);
      return res.status(response.status).json({ success: false, error: logEntry.error, metaResponse: data });
    }

    logEntry.id = data.messages?.[0]?.id || logEntry.id;
    logEntry.status = 'sent';
    messageLogs.unshift(logEntry);

    return res.json({ success: true, messageId: logEntry.id, metaResponse: data });
  } catch (err: any) {
    console.error('Error contacting Meta WhatsApp Cloud API:', err);
    logEntry.status = 'failed';
    logEntry.error = err.message || 'Unknown network error';
    messageLogs.unshift(logEntry);
    return res.status(500).json({ success: false, error: logEntry.error });
  }
});

// 5. Get recent WhatsApp logs
app.get('/api/whatsapp/logs', (_req: Request, res: Response) => {
  res.json({ logs: messageLogs.slice(0, 50) });
});

// Vite Middleware integration for dev / static for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`BUYJUMP Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
