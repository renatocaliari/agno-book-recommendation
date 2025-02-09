"use client"

import { useState } from "react"
import SearchForm from "./components/SearchForm"
import ResultsList from "./components/ResultsList"
import ErrorMessage from "./components/ErrorMessage"
import LoadingMessage from "./components/LoadingMessage"
import { searchMedia } from "./services/mediaService"
import type { MediaType, SearchResult } from "./types"

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [mediaType, setMediaType] = useState<MediaType>("book")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (query: string, type: MediaType, isCustomPrompt: boolean) => {
    setIsLoading(true)
    setHasSearched(true)
    try {
      setError(null)
      const data = await searchMedia({ query, mediaType: type, isCustomPrompt })
      setResults(data.books || data.videos || [])
    } catch (err) {
      setError('Failed to fetch results. Please try again.')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <SearchForm onSearch={handleSearch} />
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <ResultsList 
        results={results} 
        mediaType={mediaType}
        isLoading={isLoading}
        hasSearched={hasSearched}
      />
    </main>
  )
}

