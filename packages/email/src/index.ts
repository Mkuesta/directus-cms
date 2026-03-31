import type { EmailConfig, EmailClient } from './types.js';
import { sendEmail } from './send.js';
import { getEmailTemplates, getEmailTemplate, renderTemplate } from './templates.js';
import { sendFormNotification, sendOrderConfirmation } from './notifications.js';
import { createEmailApiHandler } from './api-handler.js';

export function createEmailClient(config: EmailConfig): EmailClient {
  const client: EmailClient = {
    config,
    sendEmail: (options) => sendEmail(config, options),
    getEmailTemplates: () => getEmailTemplates(config),
    getEmailTemplate: (slug) => getEmailTemplate(config, slug),
    renderTemplate,
    sendFormNotification: (options) => sendFormNotification(config, options),
    sendOrderConfirmation: (options) => sendOrderConfirmation(config, options),
    createApiHandler: () => createEmailApiHandler(config),
  };

  // Attach sendInvoice via dynamic import — only works when @react-pdf/renderer is installed.
  // Uses dynamic import to avoid pulling react-pdf into the main bundle.
  client.sendInvoice = async (options) => {
    const { sendInvoice } = await import('./invoice.js');
    return sendInvoice(config, options);
  };

  return client;
}

export type {
  EmailConfig,
  EmailCollections,
  EmailClient,
  DirectusEmailTemplate,
  EmailTemplate,
  DirectusEmailLog,
  SendEmailOptions,
  SendResult,
  EmailAttachment,
  InvoiceData,
  InvoiceLineItem,
  InvoiceStyleOptions,
  SendInvoiceOptions,
} from './types.js';

export { sendEmail } from './send.js';
export { getEmailTemplates, getEmailTemplate, renderTemplate } from './templates.js';
export { sendFormNotification, sendOrderConfirmation } from './notifications.js';
export { createEmailApiHandler } from './api-handler.js';
