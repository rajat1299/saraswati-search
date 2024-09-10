'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { searchExaAI } from '@/actions/exa-actions';
import { summarizeText } from '@/actions/openai-actions';

export default function Home() {
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState('');
  const [exaResults, setExaResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    console.log('Searching for:', query);

    const result = await searchExaAI(query);
    console.log('Exa search result:', result);

    if (result.success && result.data?.results) {
      setExaResults(result.data.results);
      console.log('Exa results set:', result.data.results);

      const relevantSources = result.data.results
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 5)
        .map(item => item.text)
        .join('\n\n');

      console.log('Relevant sources for summarization:', relevantSources);

      const summaryResult = await summarizeText(relevantSources);
      console.log('OpenAI summary result:', summaryResult);

      if (summaryResult.success && summaryResult.data) {
        setSummary(summaryResult.data);
        console.log('Summary set:', summaryResult.data);
      } else {
        setSummary('Failed to generate summary');
        console.error('Failed to generate summary:', summaryResult.error);
      }
    } else {
      setSummary('Failed to fetch search results');
      setExaResults([]);
      console.error('Failed to fetch Exa search results:', result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI-Powered Search</h1>
          <p className="text-xl text-gray-300">Get instant summaries from multiple sources</p>
        </div>

        <div className="flex items-center justify-center mb-12">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query"
            className="px-4 py-3 w-full max-w-2xl rounded-l-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {exaResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Search Results:</h2>
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-4">
                {exaResults.map((result, index) => (
                  <Link href={result.url} key={index} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                    <div className="w-72 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                      <h3 className="font-bold text-lg mb-2 line-clamp-1">{result.title}</h3>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-1">{result.url}</p>
                      <p className="text-sm line-clamp-3">{result.text}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {summary && (
          <div className="bg-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">AI-Generated Summary:</h2>
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        )}
      </main>
    </div>
  );
}