import type { SearchResult, MediaType } from "../types"
import { X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type DetailedViewProps = {
  item: SearchResult
  onClose: () => void
  mediaType: MediaType
  colorClass: string
}

export default function DetailedView({ item, onClose, mediaType, colorClass }: DetailedViewProps) {
  return (
    <TooltipProvider>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white border-4 border-black max-w-3xl w-full relative overflow-hidden">
          {/* Colored header section */}
          <div className={`${colorClass} p-8 relative`}>
            <h2 className="text-5xl font-bold text-white text-center font-display mb-4">{item.title}</h2>
            <div className="absolute top-4 right-4 bg-black text-white px-3 py-2 rounded-full font-bold border-2 border-white">
              ⭐ {item.rating}
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 bg-white text-black rounded-full hover:bg-gray-100 transition-colors border-2 border-black"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content section */}
          <div className="p-6 space-y-6">
            {/* Tags section */}
            <div className="flex flex-wrap gap-3">
              <Tooltip>
                <TooltipTrigger>
                  <span className="bg-black text-white px-3 py-2 text-base font-bold">{item.year}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Year of {mediaType === "book" ? "publication" : "release"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <span className="bg-black text-white px-3 py-2 text-base font-bold">{item.genre}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Genre</p>
                </TooltipContent>
              </Tooltip>

              {(mediaType === "movie" || mediaType === "tv show") && item.streamingOn && (
                <Tooltip>
                  <TooltipTrigger>
                    <span className="bg-black text-white px-3 py-2 text-base font-bold">{item.streamingOn}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Available on</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Book-specific tags */}
              {mediaType === "book" && (
                <>
                  {item.pageCount && (
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="bg-black text-white px-3 py-2 text-base font-bold">{item.pageCount} pages</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Page count</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  
                  {item.seriesInfo && (
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="bg-black text-white px-3 py-2 text-base font-bold">📚 Series</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.seriesInfo}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {item.audioBookAvailable && (
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="bg-black text-white px-3 py-2 text-base font-bold">🎧 Audiobook</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Audiobook available</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}

              {/* Video-specific tags */}
              {(mediaType === "movie" || mediaType === "tv show") && (
                <>
                  {item.runtime && (
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="bg-black text-white px-3 py-2 text-base font-bold">{item.runtime} min</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Runtime</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {mediaType === "tv show" && item.seasons && (
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="bg-black text-white px-3 py-2 text-base font-bold">{item.seasons} seasons</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of seasons</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}

              {/* Common additional tags */}
              {item.awards?.map((award, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger>
                    <span className="bg-black text-white px-3 py-2 text-base font-bold">{award}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Award</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              {item.contentAdvisories?.map((advisory, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger>
                    <span className="bg-black text-white px-3 py-2 text-base font-bold">{advisory}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Content Advisory</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              {/* Adicionar outras tags específicas se necessário */}
              {mediaType === "book" && (
                <>
                  {item.triggerWarnings?.map((warning, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger>
                        <span className="bg-black text-white px-3 py-2 text-base font-bold">{warning}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Trigger Warning</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  
                  {item.diversityHighlight && (
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="bg-black text-white px-3 py-2 text-base font-bold">{item.diversityHighlight}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Diversity Highlight</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {item.upcomingAdaptations && (
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="bg-black text-white px-3 py-2 text-base font-bold">{item.upcomingAdaptations}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upcoming Adaptation</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}
            </div>

            {/* Details section */}
            <div className="p-6 space-y-6">
              {/* Awards section */}
              {item.awards && item.awards.length > 0 && (
                <div className="border-t-2 border-black pt-4">
                  <p className="text-lg">
                    <span className="font-bold">🏆 Awards: </span>
                    {item.awards.join(', ')}
                  </p>
                </div>
              )}

              {/* Diversity highlight section */}
              {item.diversityHighlight && (
                <div className="border-t-2 border-black pt-4">
                  <p className="text-lg">
                    <span className="font-bold">🌈 Diversity Highlight: </span>
                    {item.diversityHighlight}
                  </p>
                </div>
              )}

              {/* Plot summary */}
              <div className="border-t-2 border-black pt-4">
                <p className="text-lg">{item.details}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

