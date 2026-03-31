import type { ValidateConfig, CheckResult, CheckDetail } from '../types.js';

export async function validateDataIntegrity(config: ValidateConfig): Promise<CheckResult> {
  if (!config.checkData) {
    return {
      name: 'Data Integrity',
      status: 'pass',
      message: 'Skipped (use --check-data to enable)',
      details: [],
      fixable: false,
    };
  }

  const details: CheckDetail[] = [];
  let issues = 0;

  // Check for posts with non-existent categories
  try {
    const postsRes = await fetch(
      `${config.url}/items/${config.prefix}_posts?fields=id,title,category&filter[category][_nnull]=true&limit=-1`,
      { headers: { Authorization: `Bearer ${config.token}` } },
    );

    if (postsRes.ok) {
      const postsData = await postsRes.json();
      const posts = postsData.data || [];

      const catsRes = await fetch(
        `${config.url}/items/${config.prefix}_blog_categories?fields=id&limit=-1`,
        { headers: { Authorization: `Bearer ${config.token}` } },
      );

      if (catsRes.ok) {
        const catsData = await catsRes.json();
        const catIds = new Set((catsData.data || []).map((c: any) => c.id));

        for (const post of posts) {
          if (post.category && !catIds.has(post.category)) {
            details.push({
              message: `Post "${post.title}" (id: ${post.id}) references non-existent category ${post.category}`,
            });
            issues++;
          }
        }
      }
    }
  } catch {
    details.push({ message: 'Error checking post-category integrity' });
  }

  return {
    name: 'Data Integrity',
    status: issues === 0 ? 'pass' : 'warn',
    message: issues === 0
      ? 'No data integrity issues found'
      : `${issues} data integrity issue(s)`,
    details,
    fixable: false,
  };
}
