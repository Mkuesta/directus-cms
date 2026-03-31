import React from 'react';

export interface TagListProps {
  tags: string[];
  baseUrl?: string;
  className?: string;
}

export function TagList({
  tags,
  baseUrl = '/tags',
  className,
}: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
      {tags.map((tag) => (
        <a
          key={tag}
          href={`${baseUrl}/${encodeURIComponent(tag)}`}
          style={{ textDecoration: 'none' }}
        >
          {tag}
        </a>
      ))}
    </div>
  );
}
