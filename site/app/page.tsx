"use client"

import { useState } from "react"
import SearchForm from "./components/SearchForm"
import ResultsList from "./components/ResultsList"
import { searchMedia } from "./services/mediaService"
import type { MediaType, SearchResult } from "./types"
import { siteConfig } from "./config"

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [mediaType, setMediaType] = useState<MediaType>("book")
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (query: string, type: MediaType) => {
    setIsLoading(true)
    try {
      const searchResults = await searchMedia(query, type)
      setResults(searchResults)
      setMediaType(type)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-yellow-200 px-4 py-6 sm:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6 sm:mb-8 text-black border-b-4 sm:border-b-8 border-black pb-2 sm:pb-4 font-display">
          {siteConfig.name}
        </h1>
        <SearchForm onSearch={handleSearch} />
        <ResultsList results={results} mediaType={mediaType} isLoading={isLoading} />
      </div>
    </main>
  )
}

