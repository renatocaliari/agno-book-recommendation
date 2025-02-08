import type { MediaType, SearchResult } from "../types"

interface BookResponse {
  title: string;
  author: string;
  publication_year: string;
  genre: string[];
  rating: string;
  page_count: string;
  plot_summary: string;
  content_advisories: string[];
  awards: string[];
  series_info?: string;
  audiobook_available?: boolean;
  upcoming_adaptations?: string;
  similarity_type: string;
  explanation: string;
}

interface VideoResponse {
  title: string;
  type: string;
  release_year?: string;
  imdb_rating?: number;
  tmdb_rating?: number;
  genre: string[];
  similarity_type: string;
  explanation: string;
  plot_summary?: string;
  directors?: string[];
  actors?: string[];
  runtime?: string;
  content_advisories?: string[];
  awards?: string[];
  series_season?: string;
  similar_videos?: string[];
  streaming_services?: string[];
}

interface BooksAPIResponse {
  books: BookResponse[];
}

interface VideosAPIResponse {
  videos: VideoResponse[];
}

const API_BASE_URL = 'https://recommendation-api-6yay.onrender.com';
const API_KEY = process.env.NEXT_PUBLIC_CLIENT_API_KEY;

if (!API_KEY) {
  console.error('API Key não encontrada! Verifique se o arquivo .env.local está configurado corretamente.');
}

const getHeaders = () => ({
  'X-API-Key': API_KEY || '',
  'Content-Type': 'application/json'
});

const fetchBooksData = async (query: string): Promise<SearchResult[]> => {
  try {
    console.log('Fetching books with query:', query);
    
    const url = `${API_BASE_URL}/books/recommendations/similar`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ book_title: query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BooksAPIResponse = await response.json();
    console.log('API Response:', data);

    return data.books.map((book: BookResponse) => ({
      id: book.title || 'Unknown',
      title: book.title || 'Unknown',
      type: 'book' as MediaType,
      year: book.publication_year ? parseInt(book.publication_year) : 0,
      rating: parseFloat(book.rating) || 0,
      genre: Array.isArray(book.genre) ? book.genre.join(', ') : 'Unknown',
      similarityType: ((): "plot & characters" | "genre & themes" | "author & writing style" => {
        switch(book.similarity_type?.toLowerCase()) {
          case "genre & themes":
            return "genre & themes";
          case "author & writing style":
            return "author & writing style";
          default:
            return "plot & characters";
        }
      })(),
      similarityJustification: book.explanation || 'No explanation provided',
      details: book.plot_summary || 'No details available',
      author: book.author,
      pageCount: book.page_count ? parseInt(book.page_count) : undefined,
      contentAdvisories: Array.isArray(book.content_advisories) ? book.content_advisories : [],
      awards: Array.isArray(book.awards) ? book.awards : [],
      seriesInfo: book.series_info,
      audiobookAvailable: book.audiobook_available,
      upcomingAdaptations: book.upcoming_adaptations
    }));
  } catch (error) {
    console.error('Error fetching books:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch books');
  }
};

const fetchMoviesData = async (query: string): Promise<SearchResult[]> => {
  try {
    console.log('Fetching movies with query:', query);
    
    const response = await fetch(`${API_BASE_URL}/videos/recommendations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        title: query,
        media_type: 'Movie'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: VideosAPIResponse = await response.json();
    console.log('API Response:', data);

    const videos = data.videos || [];

    return videos.map((video: VideoResponse) => ({
      id: video.title || 'Unknown',
      title: video.title || 'Unknown',
      type: video.type as MediaType || 'Movie',
      year: video.release_year ? parseInt(video.release_year) : 0,
      rating: video.imdb_rating || video.tmdb_rating || 0,
      genre: Array.isArray(video.genre) ? video.genre.join(', ') : 'Unknown',
      similarityType: ((): "plot & characters" | "genre & themes" | "author & writing style" => {
        switch(video.similarity_type?.toLowerCase()) {
          case "genre & themes":
            return "genre & themes";
          case "author & writing style":
            return "author & writing style";
          default:
            return "plot & characters";
        }
      })(),
      similarityJustification: video.explanation || 'No explanation provided',
      details: video.plot_summary || 'No details available',
      directors: Array.isArray(video.directors) ? video.directors : [],
      actors: Array.isArray(video.actors) ? video.actors : [],
      runtime: video.runtime ? parseInt(video.runtime) : undefined,
      contentAdvisories: Array.isArray(video.content_advisories) ? video.content_advisories : [],
      awards: Array.isArray(video.awards) ? video.awards : [],
      seriesSeason: video.series_season,
      similarVideos: Array.isArray(video.similar_videos) ? video.similar_videos : [],
      streamingOn: Array.isArray(video.streaming_services) ? video.streaming_services.join(', ') : ''
    }));
  } catch (error) {
    console.error('Error fetching movies:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch movies');
  }
};

const searchMedia = async (query: string, type: MediaType): Promise<SearchResult[]> => {
  if (type === 'book') {
    return fetchBooksData(query);
  } else {
    return fetchMoviesData(query);
  }
};

export { searchMedia };

