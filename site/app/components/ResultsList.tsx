import { useState } from "react"
import type { MediaType, SearchResult } from "../types"
import DetailedView from "./DetailedView"
import { Maximize2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ResultsSkeleton from "./ResultsSkeleton"
import LoadingMessage from "./LoadingMessage"

type ResultsListProps = {
  results: SearchResult[]
  mediaType: MediaType
  isLoading: boolean
  hasSearched: boolean
}

const getMediaColor = (type: MediaType, index: number): { bg: string, text: string } => {
  const colors = {
    book: [
      { bg: "bg-purple-600", text: "text-white" },
      { bg: "bg-yellow-400", text: "text-black" },
      { bg: "bg-blue-600", text: "text-white" },
      { bg: "bg-green-400", text: "text-black" },
      { bg: "bg-red-600", text: "text-white" },
      { bg: "bg-orange-400", text: "text-black" },
    ],
    movie: [
      { bg: "bg-emerald-600", text: "text-white" },
      { bg: "bg-pink-400", text: "text-black" },
      { bg: "bg-indigo-600", text: "text-white" },
      { bg: "bg-amber-400", text: "text-black" },
      { bg: "bg-cyan-600", text: "text-white" },
      { bg: "bg-lime-400", text: "text-black" },
    ],
    "tv show": [
      { bg: "bg-red-600", text: "text-white" },
      { bg: "bg-teal-400", text: "text-black" },
      { bg: "bg-violet-600", text: "text-white" },
      { bg: "bg-yellow-400", text: "text-black" },
      { bg: "bg-blue-600", text: "text-white" },
      { bg: "bg-green-400", text: "text-black" },
    ],
  }
  return colors[type][index % colors[type].length]
}

const getMediaEmoji = (type: MediaType) => {
  switch (type) {
    case "book":
      return "📚"
    case "movie":
      return "🎬"
    case "tv show":
      return "📺"
    default:
      return "🔍"
  }
}

export default function ResultsList({ results, mediaType, isLoading, hasSearched }: ResultsListProps) {
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null)

  if (isLoading) {
    return (
      <div>
        <LoadingMessage />
        <ResultsSkeleton />
      </div>
    )
  }

  if (hasSearched && results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No results found. Try another search!</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div>
        {results.length > 0 && (
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-black border-b-4 border-black pb-2 flex items-center">
            <span className="mr-2">{getMediaEmoji(mediaType)}</span>
            Similar {mediaType}s
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {results.map((item, index) => {
            const colorStyle = getMediaColor(mediaType, index)
            return (
              <div
                key={item.id}
                className="relative bg-white border-4 border-black cursor-pointer group transition-transform hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                onClick={() => setSelectedItem(item)}
              >
                <div
                  className={`${colorStyle.bg} ${colorStyle.text} p-4 sm:p-6 min-h-[150px] sm:min-h-[200px] flex items-center justify-center relative`}
                >
                  <h3 className="text-2xl sm:text-3xl font-bold text-white text-center font-display leading-tight">{item.title}</h3>
                  <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded-full font-bold border-2 border-white text-sm sm:text-base">
                  ⭐ {mediaType === "book" 
                        ? item.goodreadsRating || item.storygraphRating || "N/A"
                        : item.imdbRating || item.tmdbRating || "N/A"}
                  </div>
                </div>

                <div className="p-3 sm:p-4 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="bg-black text-white px-2 py-1 text-sm font-bold">{item.year}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Year of {mediaType === "book" ? "publication" : "release"}</p>
                      </TooltipContent>
                    </Tooltip>

                    {item.genre.map((genreItem, genreIndex) => (
                      <Tooltip key={genreIndex}>
                        <TooltipTrigger>
                          <span className="bg-black text-white px-2 py-1 text-sm font-bold">{genreItem}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Genre</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}

                    {(mediaType === "movie" || mediaType === "tv show") && item.streamingServices && item.streamingServices.length > 0 && item.streamingServices.map((service, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger>
                          <span className="bg-black text-white px-2 py-1 text-sm font-bold">{service}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Available on</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>

                  <p className="mt-2 sm:mt-3 text-sm border-t-2 border-black pt-2 sm:pt-3">{item.similarityJustification}</p>
                </div>

                <div className="absolute top-2 left-2 bg-white text-black p-1 rounded-full border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={20} />
                </div>
              </div>
            )
          })}
        </div>
        {selectedItem && (
          <DetailedView
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            mediaType={mediaType}
            colorClass={getMediaColor(
              mediaType,
              results.findIndex((r) => r.id === selectedItem.id)
            ).bg}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

