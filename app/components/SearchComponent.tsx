'use client'

import { useState } from 'react'
import { searchExaAI } from '../../src/actions/exa-actions'
import React from 'react'

export default function SearchComponent() {
  const [query, setQuery] = useState('')

  const handleSearch = async () => {
    console.log('Searching for:', query)
    const result = await searchExaAI(query)
    console.log('Search result:', result)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your search query"
        className="px-4 py-2 border border-gray-300 rounded-md w-64"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Search
      </button>
    </div>
  )
}