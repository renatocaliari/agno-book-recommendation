"use client"

import { useState } from "react"
import type { MediaType } from "../types"
import { Book, Film, Tv, Loader2 } from "lucide-react"
import type React from "react"
import { Button } from "../../components/ui/button"

type SearchFormProps = {
  onSearch: (query: string, type: MediaType) => void
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [query, setQuery] = useState("")
  const [mediaType, setMediaType] = useState<MediaType>("book")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSearch(query, mediaType)
    } finally {
      setIsLoading(false)
    }
  }

  const mediaTypes: { type: MediaType; icon: React.ReactNode; label: string }[] = [
    { type: "book", icon: <Book size={24} />, label: "Book" },
    { type: "movie", icon: <Film size={24} />, label: "Movie" },
    { type: "tv show", icon: <Tv size={24} />, label: "TV Show" },
  ]

  return (
    <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
      <div className="flex flex-col gap-4">
        {/* Botões de tipo de mídia */}
        <div className="flex flex-col sm:flex-row gap-2">
          {mediaTypes.map(({ type, icon, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => setMediaType(type)}
              className={`flex-1 p-2 flex items-center justify-center gap-2 text-lg sm:text-xl border-4 transition-all duration-200 ${
                mediaType === type
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-gray-100"
              }`}
            >
              {icon}
              <span className="inline">{label}</span>
            </button>
          ))}
        </div>
        {/* Campo de busca e botão */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Enter ${mediaType} title...`}
            className="flex-grow p-2 text-lg sm:text-xl border-4 border-black min-w-0"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="p-2 text-lg sm:text-xl bg-black text-white hover:bg-gray-800 h-[58px] sm:h-auto sm:min-h-[58px] w-full sm:w-[200px] rounded-none border-4 border-black"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

