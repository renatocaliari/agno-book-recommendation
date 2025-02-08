"use client"

import { useState } from "react"
import type { MediaType } from "../types"
import { Book, Film, Tv } from "lucide-react"
import type React from "react"

type SearchFormProps = {
  onSearch: (query: string, type: MediaType) => void
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [query, setQuery] = useState("")
  const [mediaType, setMediaType] = useState<MediaType>("book")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting search:", { query, mediaType })
    onSearch(query, mediaType)
  }

  const mediaTypes: { type: MediaType; icon: React.ReactNode; label: string }[] = [
    { type: "book", icon: <Book size={24} />, label: "Book" },
    { type: "movie", icon: <Film size={24} />, label: "Movie" },
    { type: "tvshow", icon: <Tv size={24} />, label: "TV Show" },
  ]

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {mediaTypes.map(({ type, icon, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => setMediaType(type)}
              className={`flex-1 p-2 flex items-center justify-center gap-2 text-xl border-4 transition-all duration-200 ${
                mediaType === type
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-gray-100"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Enter ${mediaType} title...`}
            className="flex-grow p-2 text-xl border-4 border-black"
          />
          <button type="submit" className="p-2 text-xl bg-black text-white hover:bg-gray-800">
            Search
          </button>
        </div>
      </div>
    </form>
  )
}

