import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface FAQ {
  question: string;
  answer: string;
}

interface Table {
  name?: string;
  schemaName?: string;
  schemaDescription?: string;
  headers: string[];
  rows: string[][];
}

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.DIRECTUS_STATIC_TOKEN;

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, title } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Extract FAQs and tables from Markdown content
    const faqs = extractFAQsFromMarkdown(content);
    const tables = extractTablesFromMarkdown(content);

    // Enrich tables with AI-generated schema metadata
    const enrichedTables = await enrichTablesWithAI(tables, title);

    return NextResponse.json({
      success: true,
      faqs,
      faqCount: faqs.length,
      tables: enrichedTables,
      tableCount: enrichedTables.length,
    });
  } catch (error) {
    console.error('FAQ extraction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function enrichTablesWithAI(tables: Table[], title?: string): Promise<Table[]> {
  if (tables.length === 0 || !title || !process.env.OPENAI_API_KEY) return tables;

  const enriched = await Promise.all(
    tables.map(async (table) => {
      try {
        const sampleRows = table.rows.slice(0, 3);
        const userMessage = `Article: "${title}"
Table heading: "${table.name || 'Untitled'}"
Columns: ${table.headers.join(', ')}
Row count: ${table.rows.length}
Sample rows:
${sampleRows.map(row => row.join(' | ')).join('\n')}

Return JSON: {"schemaName": "...", "schemaDescription": "..."}
- schemaName: 3-8 word dataset title (not column names). Include year/topic from article title if relevant.
- schemaDescription: 1-2 natural sentences describing what the data covers, row count, and key columns.`;

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You generate concise schema.org Dataset metadata for SEO structured data. Respond with valid JSON only, no markdown formatting.' },
              { role: 'user', content: userMessage },
            ],
            max_tokens: 200,
            temperature: 0.3,
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`OpenAI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const rawContent = aiData.choices?.[0]?.message?.content ?? '{}';
        const parsed = JSON.parse(rawContent.replace(/```json?\n?|\n?```/g, '').trim());
        return {
          ...table,
          schemaName: parsed.schemaName || undefined,
          schemaDescription: parsed.schemaDescription || undefined,
        };
      } catch (error) {
        console.error('AI enrichment failed for table:', table.name, error);
        return table;
      }
    })
  );

  return enriched;
}

function extractFAQsFromMarkdown(content: string): FAQ[] {
  const faqs: FAQ[] = [];

  const faqSectionMatch = content.match(
    /##\s+Frequently\s+Asked\s+Questions\s*\n([\s\S]*?)(?=\n##\s+[^#]|\n#\s+[^#]|$)/i
  );

  if (!faqSectionMatch) {
    return faqs;
  }

  const faqSection = faqSectionMatch[1];

  const qaPattern = /###\s+(.+?)\n+([\s\S]+?)(?=\n###\s+|\n##\s+|$)/g;
  let match;

  while ((match = qaPattern.exec(faqSection)) !== null) {
    const question = match[1].trim();
    let answer = match[2].trim();

    answer = answer
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    faqs.push({
      question,
      answer,
    });
  }

  return faqs;
}

function extractTablesFromMarkdown(content: string): Table[] {
  const tables: Table[] = [];

  const tablePattern = /(?:^|\n)(##\s+(.+?)\n\n)?(\|.+\|[\s\S]+?)(?=\n\n##|\n\n#|$)/gm;
  let match;

  while ((match = tablePattern.exec(content)) !== null) {
    const tableName = match[2]?.trim();
    const tableContent = match[3].trim();

    const lines = tableContent.split('\n').filter(line => line.trim().startsWith('|'));

    if (lines.length < 2) continue;

    const headerLine = lines[0];
    const headers = headerLine
      .split('|')
      .map(h => h.trim())
      .filter(Boolean);

    const rows: string[][] = [];
    for (let i = 2; i < lines.length; i++) {
      const cells = lines[i]
        .split('|')
        .map(c => c.trim())
        .filter(Boolean);

      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    if (headers.length > 0 && rows.length > 0) {
      tables.push({
        name: tableName,
        headers,
        rows,
      });
    }
  }

  return tables;
}
