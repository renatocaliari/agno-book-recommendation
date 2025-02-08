import { useState } from "react"
import type { MediaType, SearchResult } from "../types"
import DetailedView from "./DetailedView"
import { Maximize2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type ResultsListProps = {
  results: SearchResult[]
  mediaType: MediaType
}

const getMediaColor = (type: MediaType, index: number): string => {
  const colors = {
    book: ["bg-purple-600", "bg-indigo-600", "bg-violet-600"],
    movie: ["bg-blue-600", "bg-cyan-600", "bg-sky-600"],
    tvshow: ["bg-emerald-600", "bg-green-600", "bg-teal-600"],
  }
  return colors[type][index % 3]
}

const getMediaEmoji = (type: MediaType) => {
  switch (type) {
    case "book":
      return "📚"
    case "movie":
      return "🎬"
    case "tvshow":
      return "📺"
    default:
      return "🔍"
  }
}

export default function ResultsList({ results, mediaType }: ResultsListProps) {
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null)

  return (
    <TooltipProvider>
      <div>
        {results.length > 0 && (
          <h2 className="text-4xl font-bold mb-6 text-black border-b-4 border-black pb-2 flex items-center">
            <span className="mr-2">{getMediaEmoji(mediaType)}</span>
            Similar {mediaType}s
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item, index) => (
            <div
              key={item.id}
              className="relative bg-white border-4 border-black cursor-pointer group transition-transform hover:-translate-y-1 hover:shadow-xl"
              onClick={() => setSelectedItem(item)}
            >
              {/* Header with colored background */}
              <div
                className={`${getMediaColor(mediaType, index)} p-6 min-h-[200px] flex items-center justify-center relative`}
              >
                <h3 className="text-3xl font-bold text-white text-center font-display leading-tight">{item.title}</h3>
                <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded-full font-bold border-2 border-white">
                  ⭐ {item.rating}
                </div>
              </div>

              {/* Tags section */}
              <div className="p-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="bg-black text-white px-2 py-1 text-sm font-bold">{item.year}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Year of {mediaType === "book" ? "publication" : "release"}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <span className="bg-black text-white px-2 py-1 text-sm font-bold">{item.genre}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Genre</p>
                    </TooltipContent>
                  </Tooltip>

                  {(mediaType === "movie" || mediaType === "tvshow") && item.streamingOn && (
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="bg-black text-white px-2 py-1 text-sm font-bold">{item.streamingOn}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Available on</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {/* Similarity justification */}
                <p className="mt-3 text-sm border-t-2 border-black pt-3">{item.similarityJustification}</p>
              </div>

              {/* Expand icon */}
              <div className="absolute top-2 left-2 bg-white text-black p-1 rounded-full border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={20} />
              </div>
            </div>
          ))}
        </div>
        {selectedItem && (
          <DetailedView
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            mediaType={mediaType}
            colorClass={getMediaColor(
              mediaType,
              results.findIndex((r) => r.id === selectedItem.id),
            )}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

