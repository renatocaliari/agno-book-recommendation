"use client"

import { useState } from "react"
import SearchForm from "./components/SearchForm"
import ResultsList from "./components/ResultsList"
import { searchMedia } from "./services/mediaService"
import type { MediaType, SearchResult } from "./types"

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [mediaType, setMediaType] = useState<MediaType>("book")

  const handleSearch = async (query: string, type: MediaType, isCustomPrompt: boolean) => {
    setIsLoading(true)
    setHasSearched(true)
    setMediaType(type)
    try {
      setError(null)
      const data = await searchMedia({ query, mediaType: type, isCustomPrompt })
      setResults(data)
    } catch (err) {
      setError('Failed to fetch results. Please try again.')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <SearchForm onSearch={handleSearch} />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <ResultsList 
          results={results} 
          mediaType={mediaType}
          isLoading={isLoading}
          hasSearched={hasSearched}
        />
      </main>
    </div>
  )
}

