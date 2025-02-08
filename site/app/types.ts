export type MediaType = "book" | "movie" | "tv show"

export type SearchResult = {
  id: string
  title: string
  author?: string
  type?: string
  year: number
  rating: number
  genre: string
  subgenres?: string[]
  similarityType: "genre & themes" | "author & writing style" | "plot & characters"
  similarityJustification: string
  details: string
  // Book specific fields
  pageCount?: number
  contentAdvisories?: string[]
  awards?: string[]
  seriesInfo?: string
  similarAuthors?: string[]
  audiobookAvailable?: boolean
  upcomingAdaptations?: string
  diversityHighlight?: string
  triggerWarnings?: string[]
  // Video specific fields
  directors?: string[]
  actors?: string[]
  runtime?: number
  seriesSeason?: string
  similarVideos?: string[]
  streamingOn?: string
}
