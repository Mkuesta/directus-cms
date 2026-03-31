import React from 'react';
import type { TagCount } from '../types.js';

export interface TagCloudProps {
  tags: TagCount[];
  baseUrl?: string;
  className?: string;
  minFontSize?: number;
  maxFontSize?: number;
}

export function TagCloud({
  tags,
  baseUrl = '/tags',
  className,
  minFontSize = 0.8,
  maxFontSize = 2.0,
}: TagCloudProps) {
  if (tags.length === 0) return null;

  const maxCount = Math.max(...tags.map((t) => t.count));
  const minCount = Math.min(...tags.map((t) => t.count));
  const range = maxCount - minCount || 1;

  return (
    <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      {tags.map((tag) => {
        const weight = (tag.count - minCount) / range;
        const fontSize = minFontSize + weight * (maxFontSize - minFontSize);

        return (
          <a
            key={tag.tag}
            href={`${baseUrl}/${encodeURIComponent(tag.tag)}`}
            style={{ fontSize: `${fontSize}rem`, textDecoration: 'none' }}
            title={`${tag.count} post${tag.count !== 1 ? 's' : ''}`}
          >
            {tag.tag}
          </a>
        );
      })}
    </div>
  );
}
