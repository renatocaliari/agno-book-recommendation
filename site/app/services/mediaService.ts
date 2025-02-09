import type { MediaType, SearchResult } from "../types"

interface BookResponse {
  title: string;
  author: string;
  publication_year: string;
  genre: string[];
  goodreads_rating?: string;
  storygraph_rating?: string;
  page_count: string;
  plot_summary: string;
  content_advisories: string[];
  awards: string[];
  series_info?: string;
  audiobook_available?: boolean;
  upcoming_adaptations?: string;
  similarity_type: string;
  explanation: string;
  diversity_highlight?: string;
  trigger_warnings?: string[];
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_CLIENT_API_KEY;

if (!API_BASE_URL) {
  console.error('API URL não encontrada! Verifique se o arquivo .env.local está configurado corretamente.');
}

if (!API_KEY) {
  console.error('API Key não encontrada! Verifique se o arquivo .env.local está configurado corretamente.');
}

const getHeaders = () => ({
  'X-API-Key': API_KEY || '',
  'Content-Type': 'application/json'
});

export class MediaServiceError extends Error {
  constructor(
    message: string,
    public readonly type: 'API_ERROR' | 'NETWORK_ERROR' | 'CORS_ERROR' | 'UNKNOWN_ERROR'
  ) {
    super(message);
    this.name = 'MediaServiceError';
  }
}

// const fetchBooksData = async (query: string): Promise<SearchResult[]> => {
//   try {
//     console.log('Fetching books with query:', query);
    
//     const url = `${API_BASE_URL}/books/recommendations/similar`;
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: getHeaders(),
//       body: JSON.stringify({ book_title: query })
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('API Error:', errorText);
//       throw new MediaServiceError(
//         'Failed to fetch book recommendations. Please try again later.',
//         'API_ERROR'
//       );
//     }

//     const data: BooksAPIResponse = await response.json();
//     console.log('API Response:', data);

//     if (!data.books || !Array.isArray(data.books)) {
//       throw new MediaServiceError(
//         'Invalid response format from the server.',
//         'API_ERROR'
//       );
//     }

//     return data.books.map((book: BookResponse) => ({
//       id: book.title || 'Unknown',
//       title: book.title || 'Unknown',
//       type: 'book' as MediaType,
//       year: book.publication_year ? parseInt(book.publication_year) : 0,
//       goodreadsRating: book.goodreads_rating ? parseFloat(book.goodreads_rating) : undefined,
//       storygraphRating: book.storygraph_rating ? parseFloat(book.storygraph_rating) : undefined,
//       genre: book.genre || [],
//       similarityType: ((): "plot & characters" | "genre & themes" | "author & writing style" => {
//         switch(book.similarity_type?.toLowerCase()) {
//           case "genre & themes":
//             return "genre & themes";
//           case "author & writing style":
//             return "author & writing style";
//           default:
//             return "plot & characters";
//         }
//       })(),
//       similarityJustification: book.explanation || 'No explanation provided',
//       details: book.plot_summary || 'No details available',
//       author: book.author,
//       pageCount: book.page_count ? parseInt(book.page_count) : undefined,
//       contentAdvisories: book.content_advisories || [],
//       awards: book.awards || [],
//       seriesInfo: book.series_info,
//       audiobookAvailable: book.audiobook_available,
//       upcomingAdaptations: book.upcoming_adaptations,
//       diversityHighlight: book.diversity_highlight,
//       triggerWarnings: book.trigger_warnings || []
//     }));
//   } catch (error) {
//     console.error('Error fetching books:', error);
    
//     if (error instanceof MediaServiceError) {
//       throw error;
//     }

//     if (error instanceof TypeError && error.message === 'Failed to fetch') {
//       throw new MediaServiceError(
//         'Unable to connect to the recommendation service. Please check your internet connection.',
//         'NETWORK_ERROR'
//       );
//     }

//     if (error instanceof Error && error.message.includes('CORS')) {
//       throw new MediaServiceError(
//         'Service temporarily unavailable. Please try again in a few minutes.',
//         'CORS_ERROR'
//       );
//     }

//     throw new MediaServiceError(
//       'An unexpected error occurred. Please try again later.',
//       'UNKNOWN_ERROR'
//     );
//   }
// };

// const fetchMoviesData = async (query: string): Promise<SearchResult[]> => {
//   try {
//     console.log('Fetching movies with query:', query);
    
//     const response = await fetch(`${API_BASE_URL}/videos/recommendations`, {
//       method: 'POST',
//       headers: getHeaders(),
//       body: JSON.stringify({
//         title: query,
//         media_type: 'Movie'
//       })
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('API Error:', errorText);
//       throw new MediaServiceError(
//         'Failed to fetch movie recommendations. Please try again later.',
//         'API_ERROR'
//       );
//     }

//     const data: VideosAPIResponse = await response.json();
//     console.log('API Response:', data);

//     if (!data.videos || !Array.isArray(data.videos)) {
//       throw new MediaServiceError(
//         'Invalid response format from the server.',
//         'API_ERROR'
//       );
//     }

//     const videos = data.videos || [];

//     return videos.map((video: VideoResponse) => ({
//       id: video.title || 'Unknown',
//       title: video.title || 'Unknown',
//       type: video.type as MediaType || 'Movie',
//       year: video.release_year ? parseInt(video.release_year) : 0,
//       imdbRating: video.imdb_rating,
//       tmdbRating: video.tmdb_rating,
//       genre: video.genre || [],
//       similarityType: ((): "plot & characters" | "genre & themes" | "author & writing style" => {
//         switch(video.similarity_type?.toLowerCase()) {
//           case "genre & themes":
//             return "genre & themes";
//           case "author & writing style":
//             return "author & writing style";
//           default:
//             return "plot & characters";
//         }
//       })(),
//       similarityJustification: video.explanation || 'No explanation provided',
//       details: video.plot_summary || 'No details available',
//       directors: video.directors || [],
//       actors: video.actors || [],
//       runtime: video.runtime ? parseInt(video.runtime) : undefined,
//       seasons: video.series_season,
//       streamingServices: video.streaming_services || []
//     }));
//   } catch (error) {
//     console.error('Error fetching movies:', error);
    
//     if (error instanceof MediaServiceError) {
//       throw error;
//     }

//     if (error instanceof TypeError && error.message === 'Failed to fetch') {
//       throw new MediaServiceError(
//         'Unable to connect to the recommendation service. Please check your internet connection.',
//         'NETWORK_ERROR'
//       );
//     }

//     if (error instanceof Error && error.message.includes('CORS')) {
//       throw new MediaServiceError(
//         'Service temporarily unavailable. Please try again in a few minutes.',
//         'CORS_ERROR'
//       );
//     }

//     throw new MediaServiceError(
//       'An unexpected error occurred. Please try again later.',
//       'UNKNOWN_ERROR'
//     );
//   }
// };

interface SearchRequest {
  query: string;
  isCustomPrompt: boolean;
  mediaType: MediaType;
}

export async function searchMedia({ query, isCustomPrompt, mediaType }: SearchRequest): Promise<SearchResult[]> {
  let endpoint = '';
  
  if (mediaType === 'book') {
    endpoint = isCustomPrompt 
      ? '/books/recommendations/custom'
      : '/books/recommendations';
  } else {
    endpoint = isCustomPrompt
      ? '/videos/recommendations/custom'
      : '/videos/recommendations';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY || '',
    },
    body: JSON.stringify(
      isCustomPrompt
        ? { prompt: query }
        : mediaType === 'book'
          ? { title: query }
          : { title: query, media_type: mediaType }
    ),
  });

  if (!response.ok) {
    throw new MediaServiceError(`Failed to fetch recommendations`, 'API_ERROR');
  }

  const data = await response.json();

  if (mediaType === 'book') {
    const booksData = data as BooksAPIResponse;
    if (!booksData.books || !Array.isArray(booksData.books)) {
      throw new MediaServiceError('Invalid book response format', 'API_ERROR');
    }

    return booksData.books.map((book: BookResponse) => ({
      id: book.title || 'Unknown',
      title: book.title || 'Unknown',
      type: 'book' as MediaType,
      year: book.publication_year ? parseInt(book.publication_year) : 0,
      goodreadsRating: book.goodreads_rating ? parseFloat(book.goodreads_rating) : undefined,
      storygraphRating: book.storygraph_rating ? parseFloat(book.storygraph_rating) : undefined,
      genre: book.genre || [],
      similarityType: ((): "plot & characters" | "genre & themes" | "author & writing style" => {
        switch(book.similarity_type?.toLowerCase()) {
          case "genre & themes": return "genre & themes";
          case "author & writing style": return "author & writing style";
          default: return "plot & characters";
        }
      })(),
      similarityJustification: book.explanation || 'No explanation provided',
      details: book.plot_summary || 'No details available',
      author: book.author,
      pageCount: book.page_count ? parseInt(book.page_count) : undefined,
      contentAdvisories: book.content_advisories || [],
      awards: book.awards || [],
      seriesInfo: book.series_info,
      audiobookAvailable: book.audiobook_available,
      upcomingAdaptations: book.upcoming_adaptations,
      diversityHighlight: book.diversity_highlight,
      triggerWarnings: book.trigger_warnings || []
    }));
  } else {
    const videosData = data as VideosAPIResponse;
    if (!videosData.videos || !Array.isArray(videosData.videos)) {
      throw new MediaServiceError('Invalid video response format', 'API_ERROR');
    }

    return videosData.videos.map((video: VideoResponse) => ({
      id: video.title || 'Unknown',
      title: video.title || 'Unknown',
      type: video.type as MediaType || 'Movie',
      year: video.release_year ? parseInt(video.release_year) : 0,
      imdbRating: video.imdb_rating,
      tmdbRating: video.tmdb_rating,
      genre: video.genre || [],
      similarityType: ((): "plot & characters" | "genre & themes" | "author & writing style" => {
        switch(video.similarity_type?.toLowerCase()) {
          case "genre & themes": return "genre & themes";
          case "author & writing style": return "author & writing style";
          default: return "plot & characters";
        }
      })(),
      similarityJustification: video.explanation || 'No explanation provided',
      details: video.plot_summary || 'No details available',
      directors: video.directors || [],
      actors: video.actors || [],
      runtime: video.runtime ? parseInt(video.runtime) : undefined,
      seasons: video.series_season,
      streamingServices: video.streaming_services || []
    }));
  }
}

