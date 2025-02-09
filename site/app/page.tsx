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

  const handleSearch = async (query: string, type: MediaType) => {
    setIsLoading(true)
    setError(null)
    try {
      const searchResults = await searchMedia(query, type)
      setResults(searchResults)
      setMediaType(type)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <SearchForm onSearch={handleSearch} />
        
        {error && <ErrorMessage message={error} />}
        
        {!error && (
          <>
            {isLoading && <LoadingMessage />}
            <ResultsList 
              results={results} 
              mediaType={mediaType} 
              isLoading={isLoading}
              hasSearched={hasSearched}
            />
          </>
        )}
      </div>
    </main>
  )
}

