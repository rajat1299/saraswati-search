'use client';

import '@radix-ui/themes/styles.css';
import { Theme, Text, TextField, Button, Flex, ScrollArea } from '@radix-ui/themes';
import React, { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import Link from 'next/link';
import { searchExaAI } from '../src/actions/exa-actions';
import { Playfair_Display } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExaResult } from 'exa-js';
import { Message } from 'ai/react';

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function Home() {
  const [exaResults, setExaResults] = useState<ExaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Set the default height to 80% of the original height (64.8px instead of 81px)
      const defaultHeight = 64.8;
      textareaRef.current.style.height = `${defaultHeight}px`;
      const scrollHeight = textareaRef.current.scrollHeight;
      
      // If content exceeds the default height, allow it to grow
      if (scrollHeight > defaultHeight) {
        textareaRef.current.style.height = `${scrollHeight}px`;
      }
    }
  }, [input]);

  const handleSearch = useCallback(async () => {
    if (!input.trim()) {
      console.log('Search query is empty');
      return;
    }

    setIsLoading(true);
    setIsSearchPerformed(true);
    console.log('Searching for:', input);

    try {
      const result = await searchExaAI(input);
      console.log('Exa search result:', result);

      if (result.success && result.data?.results) {
        setExaResults(result.data.results);
        console.log('Exa results set:', result.data.results);

        const relevantSources = result.data.results
          .sort((a: ExaResult, b: ExaResult) => (b.score ?? 0) - (a.score ?? 0))
          .slice(0, 5);

        const sourcesText = relevantSources.map((item: ExaResult) => item.text).join('\n\n');

        const response = await fetch('/api/completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: input },
              { role: 'system', content: `Context: ${sourcesText}` },
            ],
          }),
        });

        if (response.ok) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let accumulatedResponse = '';

          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            accumulatedResponse += decoder.decode(value);
          }

          console.log('Accumulated Response:', accumulatedResponse);

          const newMessage: Message = {
            role: 'assistant',
            content: accumulatedResponse,
            id: Date.now().toString(),
          };
          setChatMessages([{ role: 'user', content: input, id: (Date.now() - 1).toString() }, newMessage]);
        } else {
          throw new Error('Failed to get response');
        }
      } else {
        throw new Error('No search results found');
      }
    } catch (error) {
      console.error('Error during search:', error);
      setChatMessages([{
        role: 'assistant',
        content: 'An error occurred during the search',
        id: Date.now().toString(),
      }]);
      setExaResults([]);
    }

    setIsLoading(false);
  }, [input]);

  const handleReset = () => {
    setInput('');
    setExaResults([]);
    setChatMessages([]);
    setIsSearchPerformed(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <Theme appearance="dark">
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
        
        <div className={`relative z-10 min-h-screen bg-black bg-opacity-50 transition-colors duration-300 ${playfair.className}`}>
          <main className={`max-w-6xl mx-auto px-4 py-12 transition-all duration-500 ease-in-out ${exaResults.length > 0 ? '' : 'h-screen flex flex-col justify-center'}`}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`transition-all duration-500 ease-in-out ${exaResults.length > 0 ? 'mb-8' : 'mb-12'}`}
            >
              <div className={`w-[680px] mx-auto ${exaResults.length > 0 ? 'h-[80px]' : 'h-[114px]'}`}>
                <h1 className={`text-center font-bold leading-none transition-all duration-500 ease-in-out ${exaResults.length > 0 ? 'text-5xl' : 'text-[64px]'} text-white`}>Welcome to Saraswati</h1>
              </div>
              <div className={`w-[438px] mx-auto ${exaResults.length > 0 ? 'h-[60px]' : 'h-[91px]'}`}>
                <p className={`text-center font-medium leading-none transition-all duration-500 ease-in-out ${exaResults.length > 0 ? 'text-2xl' : 'text-[32px]'} text-white`}>Knowledge at your fingertips</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`w-[1022px] relative mx-auto ${exaResults.length > 0 ? 'mb-12' : ''}`}
            >
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  disabled={isSearchPerformed}
                  className="w-full rounded-[30px] border px-6 py-4 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-300 bg-[#2a2a2a] border-[#cac5c5] text-[#938e8e] resize-none overflow-hidden"
                  style={{
                    minHeight: '64.8px', // 80% of 81px
                    lineHeight: '1.5', // Adjust line height for better text alignment
                  }}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading || isSearchPerformed}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 transition-colors duration-300 bg-gray-700 text-white hover:bg-gray-600"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
              {isSearchPerformed && (
                <button 
                  onClick={handleReset}
                  className="mt-4 px-6 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-300 bg-gray-700 text-white hover:bg-gray-600"
                >
                  Reset Search
                </button>
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
                  <h2 className="text-2xl font-bold mb-4 text-white">Search Results:</h2>
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
                              className="w-72 p-4 rounded-lg transition-colors duration-300 bg-[#1a1a1a] hover:bg-[#252525]"
                            >
                              <h3 className="font-bold text-lg mb-2 line-clamp-1 text-white">{result.title}</h3>
                              <p className="text-sm text-[#938e8e] mb-2 line-clamp-1">{result.url}</p>
                              <p className="text-sm line-clamp-3 text-white">{result.text}</p>
                            </motion.div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {chatMessages.length > 0 && (
              <div className="w-full max-w-[1022px] mx-auto mt-8">
                <Flex direction="column" gap="4">
                  <Text size="6" weight="bold" className="text-white">Saraswati</Text>
                  <div className="w-full rounded bg-[#1a1a1a] p-4">
                    {chatMessages.filter(message => message.role === 'assistant').map((message, index) => (
                      <React.Fragment key={`${message.id}-${index}`}>
                        {index > 0 && <hr className="my-4 border-gray-600" />}
                        <Text className="text-white whitespace-pre-wrap">
                          {message.content.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4">{paragraph}</p>
                          ))}
                        </Text>
                      </React.Fragment>
                    ))}
                  </div>
                </Flex>
              </div>
            )}
          </main>
        </div>
      </div>
    </Theme>
  );
}
