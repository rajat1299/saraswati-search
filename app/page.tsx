'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { searchExaAI } from '../src/actions/exa-actions';
import { summarizeText } from '../src/actions/openai-actions';
import { Playfair_Display } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExaResult } from 'exa-js';

const playfair = Playfair_Display({ subsets: ['latin'] });

// Mock autocomplete suggestions (replace with actual API call later)
const getAutocompleteSuggestions = (query: string) => {
  const suggestions = [
    'artificial intelligence',
    'machine learning',
    'deep learning',
    'neural networks',
    'data science',
  ];
  return suggestions.filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()));
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState('');
  const [exaResults, setExaResults] = useState<ExaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      const newSuggestions = getAutocompleteSuggestions(query);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) {
      console.log('Search query is empty');
      return;
    }

    setIsLoading(true);
    console.log('Searching for:', query);

    // Add to recent searches
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    try {
      const result = await searchExaAI(query);
      console.log('Exa search result:', result);

      if (result.success && result.data?.results) {
        setExaResults(result.data.results);
        console.log('Exa results set:', result.data.results);

        const relevantSources = result.data.results
          .sort((a: ExaResult, b: ExaResult) => ((b.score ?? 0) - (a.score ?? 0)))
          .slice(0, 5)
          .map((item: ExaResult) => item.text)
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
        setSummary('No results found');
        setExaResults([]);
        console.error('No search results found');
      }
    } catch (error) {
      console.error('Error during search:', error);
      setSummary('An error occurred during the search');
      setExaResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch();
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    handleSearch();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const hasResults = exaResults.length > 0 || summary;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/188442-882719448_medium.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className={`relative z-10 min-h-screen ${isDarkMode ? 'bg-black bg-opacity-50' : 'bg-white bg-opacity-50'} transition-colors duration-300 ${playfair.className}`}>
        <main className={`max-w-6xl mx-auto px-4 py-12 transition-all duration-500 ease-in-out ${hasResults ? '' : 'h-screen flex flex-col justify-center'}`}>
          <button
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-2 rounded-full bg-opacity-20 backdrop-blur-md"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`transition-all duration-500 ease-in-out ${hasResults ? 'mb-8' : 'mb-12'}`}
          >
            <div className={`w-[680px] mx-auto ${hasResults ? 'h-[80px]' : 'h-[114px]'}`}>
              <h1 className={`text-center font-bold leading-none transition-all duration-500 ease-in-out ${hasResults ? 'text-5xl' : 'text-[64px]'} ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Welcome to Saraswati</h1>
            </div>
            <div className={`w-[438px] mx-auto ${hasResults ? 'h-[60px]' : 'h-[91px]'}`}>
              <p className={`text-center font-medium leading-none transition-all duration-500 ease-in-out ${hasResults ? 'text-2xl' : 'text-[32px]'} ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>Knowledge at your fingertips</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`w-[1022px] relative mx-auto ${hasResults ? 'mb-12' : ''}`}
          >
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything..."
                className={`w-full h-[81px] rounded-[30px] border px-6 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-[#1d1c1c] border-[#cac5c5] text-[#938e8e]'
                    : 'bg-gray-50 border-gray-300 text-gray-700'
                }`}
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-t-2 border-current rounded-full"
                  />
                ) : (
                  'Search'
                )}
              </button>
            </div>
            
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-[#1d1c1c] border border-[#cac5c5] rounded-b-lg mt-1">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-6 py-2 hover:bg-[#2a2a2a] cursor-pointer text-[#938e8e]"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}

            {recentSearches.length > 0 && !hasResults && (
              <div className="mt-4">
                <h3 className="text-white text-lg mb-2">Recent Searches:</h3>
                <ul className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <li
                      key={index}
                      className="bg-[#1d1c1c] text-[#938e8e] px-3 py-1 rounded-full cursor-pointer hover:bg-[#2a2a2a]"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      {search}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {exaResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[1022px] mx-auto mb-12"
              >
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Search Results:</h2>
                <div className="overflow-x-auto pb-4">
                  <div className="flex space-x-4">
                    {exaResults.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Link href={result.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-72 p-4 rounded-lg transition-colors duration-300 ${
                              isDarkMode
                                ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                                : 'bg-white hover:bg-gray-100 shadow-md'
                            }`}
                          >
                            <h3 className={`font-bold text-lg mb-2 line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{result.title}</h3>
                            <p className="text-sm text-[#938e8e] mb-2 line-clamp-1">{result.url}</p>
                            <p className={`text-sm line-clamp-3 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>{result.text}</p>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`w-full max-w-[1022px] mx-auto rounded-lg p-6 shadow-lg transition-colors duration-300 ${
                  isDarkMode ? 'bg-[#1d1c1c]' : 'bg-gray-50'
                }`}
              >
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>AI-Generated Summary:</h2>
                <p className={`text-lg leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>{summary}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}