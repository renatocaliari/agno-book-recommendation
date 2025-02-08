export type MediaType = "book" | "movie" | "tv show"

export type SearchResult = {
  id: string
  title: string
  type: MediaType
  year: number
  genre: string[]
  subgenres?: string[]
  similarityType: "genre & themes" | "author & writing style" | "plot & characters"
  similarityJustification: string
  details: string
  
  // Book specific fields
  author?: string
  goodreadsRating?: number
  storygraphRating?: number
  pageCount?: number
  contentAdvisories?: string[]
  awards?: string[]
  seriesInfo?: string
  audiobookAvailable?: boolean
  upcomingAdaptations?: string
  diversityHighlight?: string
  triggerWarnings?: string[]
  
  // Video specific fields
  directors?: string[]
  actors?: string[]
  imdbRating?: number
  tmdbRating?: number
  runtime?: number
  seasons?: string
  streamingServices?: string[]
}
