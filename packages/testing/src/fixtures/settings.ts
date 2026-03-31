export function createDirectusSiteSettings(overrides?: Record<string, any>) {
  return {
    id: 1,
    site_name: 'Test Site',
    site_title: 'Test Site Title',
    site_description: 'A test site for unit testing',
    default_author_name: 'Test Author',
    default_author_title: 'Test Author Title',
    default_author_url: null,
    default_author_image: null,
    twitter_handle: null,
    linkedin_url: null,
    default_article_image: null,
    default_og_image: null,
    theme_color: '#000000',
    ...overrides,
  };
}

export function createSiteSettings(overrides?: Record<string, any>) {
  return {
    siteName: 'Test Site',
    siteTitle: 'Test Site Title',
    siteDescription: 'A test site for unit testing',
    defaultAuthorName: 'Test Author',
    defaultAuthorTitle: 'Test Author Title',
    defaultAuthorUrl: undefined,
    twitterHandle: undefined,
    linkedinUrl: undefined,
    themeColor: '#000000',
    ...overrides,
  };
}
