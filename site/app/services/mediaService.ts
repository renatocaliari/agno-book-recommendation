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
    console.log('Using API Key:', API_KEY); 
    
    const url = `${API_BASE_URL}/books/recommendations/similar`;
    const body = JSON.stringify({ book_title: query });
    
    console.log('Request details:', {
      url,
      method: 'POST',
      headers: getHeaders(),
      body
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    return data.books.map((book: any) => ({
      id: book.title,
      title: book.title,
      year: parseInt(book.publication_year),
      rating: book.rating,
      genre: book.genres.join(', '),
      similarityType: book.similarity_type,
      similarityJustification: book.explanation,
      details: book.plot_summary
    }));
  } catch (error) {
    console.error('Error details:', {
      error,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

const fetchMoviesData = async (query: string): Promise<SearchResult[]> => {
  try {
    console.log('Fetching movies with query:', query);
    console.log('Using API Key:', API_KEY); // Debug log
    
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
    console.log('API Response:', data); // Debug log
    
    return data.videos.map((video: any) => ({
      id: video.title,
      title: video.title,
      year: parseInt(video.release_year),
      rating: video.rating,
      genre: video.genres.join(', '),
      similarityType: 'plot & characters',
      similarityJustification: video.explanation,
      streamingOn: video.streaming_services?.join(', '),
      details: video.plot_summary
    }));
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error; // Re-throw para melhor tratamento de erro
  }
}

export const searchMedia = async (query: string, type: MediaType): Promise<SearchResult[]> => {
  console.log('Searching media:', { query, type }); // Debug log
  try {
    if (type === 'book') {
      return await fetchBooksData(query);
    } else {
      return await fetchMoviesData(query);
    }
  } catch (error) {
    console.error('Error in searchMedia:', error);
    return [];
  }
}

