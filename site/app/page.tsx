"use client"

import { useState } from "react"
import SearchForm from "./components/SearchForm"
import ResultsList from "./components/ResultsList"
import { searchMedia } from "./services/mediaService"
import type { MediaType, SearchResult } from "./types"

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [mediaType, setMediaType] = useState<MediaType>("book")

  const handleSearch = async (query: string, type: MediaType) => {
    const searchResults = await searchMedia(query, type)
    setResults(searchResults)
    setMediaType(type)
  }

  return (
    <main className="min-h-screen bg-yellow-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold mb-8 text-black border-b-8 border-black pb-4 font-display">
          Media Matchmaker
        </h1>
        <SearchForm onSearch={handleSearch} />
        <ResultsList results={results} mediaType={mediaType} />
      </div>
    </main>
  )
}

