import React from 'react';
import type { SearchResult } from '../types.js';

export interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  renderResult?: (result: SearchResult, query: string) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const regex = new RegExp(`(${terms.map(escapeRegex).join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => {
    const isMatch = terms.some((t) => part.toLowerCase() === t);
    return isMatch ? <mark key={i}>{part}</mark> : part;
  });
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function DefaultResult({ result, query }: { result: SearchResult; query: string }) {
  return (
    <div className="search-result" data-type={result.type}>
      <a href={result.url}>
        <h3>{highlightText(result.title, query)}</h3>
      </a>
      {result.snippet && (
        <p className="search-result-snippet">
          {highlightText(result.snippet, query)}
        </p>
      )}
      <span className="search-result-type">{result.type}</span>
    </div>
  );
}

export function SearchResults({
  results,
  query,
  renderResult,
  emptyMessage = 'No results found.',
  className,
}: SearchResultsProps) {
  if (results.length === 0) {
    return <div className={className}><p>{emptyMessage}</p></div>;
  }

  return (
    <div className={className}>
      {results.map((result) => (
        <div key={`${result.type}-${result.id}`}>
          {renderResult ? renderResult(result, query) : <DefaultResult result={result} query={query} />}
        </div>
      ))}
    </div>
  );
}
