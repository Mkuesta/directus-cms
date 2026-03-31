let _templateId = 1;

export function resetEmailTemplateCounter() { _templateId = 1; }

export function createDirectusEmailTemplate(overrides?: Record<string, any>) {
  const id = _templateId++;
  return {
    id,
    slug: `template-${id}`,
    name: `Test Template ${id}`,
    subject: `Test Subject {{name}}`,
    html_body: `<h1>Hello {{name}}</h1><p>This is test template ${id}.</p>`,
    text_body: `Hello {{name}}, this is test template ${id}.`,
    variables: ['name'],
    status: 'active',
    site: 1,
    date_created: '2024-01-15T10:00:00Z',
    date_updated: null,
    ...overrides,
  };
}

export function createEmailTemplate(overrides?: Record<string, any>) {
  const id = _templateId++;
  return {
    id,
    slug: `template-${id}`,
    name: `Test Template ${id}`,
    subject: `Test Subject {{name}}`,
    htmlBody: `<h1>Hello {{name}}</h1><p>This is test template ${id}.</p>`,
    textBody: `Hello {{name}}, this is test template ${id}.`,
    variables: ['name'],
    status: 'active' as const,
    ...overrides,
  };
}
