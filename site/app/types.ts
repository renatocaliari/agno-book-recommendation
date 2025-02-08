export type MediaType = "book" | "movie" | "tvshow"

export type SearchResult = {
  id: string
  title: string
  year: number
  rating: number
  genre: string
  similarityType: "genre & themes" | "author & writing style" | "plot & characters"
  similarityJustification: string
  streamingOn?: string
  details: string
}

