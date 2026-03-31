import type { FormConfig, FormClient } from './types';
import { submitForm, getSubmissions } from './submissions';
import { createApiHandler } from './api-handler';

/**
 * Creates a form client with all helpers pre-bound to the given config.
 *
 * Usage:
 *   const forms = createFormClient({ directus, collections: { submissions: 'form_submissions' }, ... });
 *   await forms.submitForm({ form: 'contact', data: { name: 'John', email: 'john@example.com' } });
 */
export function createFormClient(config: FormConfig): FormClient {
  return {
    config,
    submitForm: (options) => submitForm(config, options),
    getSubmissions: (form, options) => getSubmissions(config, form, options),
    createApiHandler: () => createApiHandler(config),
  };
}

// Re-export all types
export type {
  FormConfig,
  FormCollections,
  FormClient,
  DirectusFormSubmission,
  FormSubmission,
  SubmitFormOptions,
  SubmitResult,
} from './types';

// Re-export standalone functions
export { submitForm, getSubmissions } from './submissions';
export { createApiHandler } from './api-handler';
export { checkHoneypot, checkRateLimit } from './spam-protection';
