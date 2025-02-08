import type { MediaType, SearchResult } from "../types"

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

    const data = await response.json();
    console.log('API Response:', data); // Adicionar log para debug

    return data.map((book: any) => ({
      id: book.title || 'Unknown',
      title: book.title || 'Unknown',
      author: book.author || 'Unknown',
      year: book.publication_year ? parseInt(book.publication_year) : 0,
      rating: book.goodreads_rating || book.storygraph_rating || 0,
      genre: Array.isArray(book.genre) ? book.genre.join(', ') : 'Unknown',
      subgenres: Array.isArray(book.subgenres) ? book.subgenres : [],
      similarityType: book.similarity_type || 'Unknown',
      similarityJustification: book.explanation || 'No explanation provided',
      details: book.plot_summary || 'No details available',
      pageCount: book.page_count,
      contentAdvisories: Array.isArray(book.content_advisories) ? book.content_advisories : [],
      awards: Array.isArray(book.awards) ? book.awards : [],
      seriesInfo: book.series_info,
      similarAuthors: Array.isArray(book.similar_authors) ? book.similar_authors : [],
      audiobookAvailable: book.audiobook_available,
      upcomingAdaptations: book.upcoming_adaptations,
      diversityHighlight: book.diversity_highlight,
      triggerWarnings: Array.isArray(book.trigger_warnings) ? book.trigger_warnings : []
    }));
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
}

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

    const data = await response.json();
    console.log('API Response:', data); // Adicionar log para debug

    return data.map((video: any) => ({
      id: video.title || 'Unknown',
      title: video.title || 'Unknown',
      type: video.type || 'Movie',
      year: video.release_year ? parseInt(video.release_year) : 0,
      rating: video.imdb_rating || video.tmdb_rating || 0,
      genre: Array.isArray(video.genre) ? video.genre.join(', ') : 'Unknown',
      similarityType: video.similarity_type || 'plot & characters',
      similarityJustification: video.explanation || 'No explanation provided',
      details: video.plot_summary || 'No details available',
      directors: Array.isArray(video.directors) ? video.directors : [],
      actors: Array.isArray(video.actors) ? video.actors : [],
      runtime: video.runtime,
      contentAdvisories: Array.isArray(video.content_advisories) ? video.content_advisories : [],
      awards: Array.isArray(video.awards) ? video.awards : [],
      seriesSeason: video.series_season,
      similarVideos: Array.isArray(video.similar_videos) ? video.similar_videos : [],
      streamingOn: Array.isArray(video.streaming_services) ? video.streaming_services.join(', ') : undefined
    }));
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
}

export const searchMedia = async (query: string, type: MediaType): Promise<SearchResult[]> => {
  console.log('Searching media:', { query, type });
  try {
    if (type === 'book') {
      return await fetchBooksData(query);
    } else {
      return await fetchMoviesData(query);
    }
  } catch (error) {
    console.error('Error in searchMedia:', error);
    throw error;
  }
};

