from fastapi import FastAPI, HTTPException, Security, Depends, Request
from fastapi.security.api_key import APIKeyHeader, APIKey
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel, Field
from typing import Optional
import os
from dotenv import load_dotenv
from textwrap import dedent
from decimal import Decimal

from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools.exa import ExaTools

# Load environment variables
load_dotenv()
API_KEY_GEMINI = os.getenv('API_KEY_GEMINI')
API_KEY_EXA = os.getenv('API_KEY_EXA')
API_KEY_TMDB = os.getenv('API_KEY_TMDB')
API_KEY = os.getenv('CLIENT_API_KEY')

# API Key security
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == API_KEY:
        return api_key_header
    raise HTTPException(
        status_code=403,
        detail="Invalid API Key"
    )

# Inicializa o limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Media Recommendation API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mediamatchmaker.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Models for Books
class Book(BaseModel):
    title: str = Field(..., description="The title of the book")
    author: str = Field(..., description="The author of the book")
    similarity_type: str = Field(..., description="The type of similarity: genre & themes, author & writing style, plot & characters")
    publication_year: str = Field(..., description="The publication year")
    explanation: str = Field(..., description="The explanation: why the book is similar?")
    genre: list[str] = Field(..., description="The genre of the book starting with emojis representing the genre")
    subgenres: Optional[list[str]] = Field(None, description="The subgenres")
    goodreads_rating: Optional[Decimal] = Field(None, description="The Goodreads rating")
    storygraph_rating: Optional[Decimal] = Field(None, description="The Storygraph rating")
    page_count: Optional[int] = Field(None, description="The page count")
    plot_summary: str = Field(..., description="The plot summary")
    content_advisories: Optional[list[str]] = Field(None, description="The content advisories")
    awards: Optional[list[str]] = Field(None, description="The awards")
    series_info: Optional[str] = Field(None, description="The series information")
    audiobook_available: Optional[bool] = Field(None, description="Audiobook availability")
    upcoming_adaptations: Optional[str] = Field(None, description="Upcoming adaptations")
    diversity_highlight: Optional[str] = Field(None, description="Diversity highlight")
    trigger_warnings: Optional[list[str]] = Field(None, description="Trigger warnings")

class ListBooks(BaseModel):
    books: list[Book]

class BookRequest(BaseModel):
    book_title: str = Field(..., description="The title of the book to find recommendations for")

class CustomPromptRequest(BaseModel):
    prompt: str = Field(..., description="Custom prompt for book recommendations")

class Prompts(BaseModel):
    prompts: list[str] = Field(default_factory=list, description="A list of prompts")

# Models for Videos
class Video(BaseModel):
    title: str = Field(..., description="The title of the movie or TV show")
    type: str = Field(..., description="Whether it's a 'Movie' or 'TV Show'")
    similarity_type: str = Field(..., description="The type of similarity: genre & themes, author & writing style, plot & characters")
    explanation: str = Field(..., description="The explanation: why that movie or tv show is similar?")
    directors: Optional[list[str]] = Field(None, description="The director(s) of the movie or TV show")
    actors: list[str] = Field(..., description="The main actors in the movie or TV show")
    genre: list[str] = Field(..., description="The genre(s) of the movie or TV show, starting with emojis")
    release_year: int = Field(..., description="The release year")
    plot_summary: str = Field(..., description="A brief summary of the plot")
    imdb_rating: Optional[float] = Field(None, description="The IMDB rating")
    tmdb_rating: Optional[float] = Field(None, description="The TMDB rating")
    runtime: Optional[int] = Field(None, description="The runtime in minutes")
    content_advisories: Optional[list[str]] = Field(None, description="Content advisories")
    awards: Optional[list[str]] = Field(None, description="Awards won")
    series_season: Optional[str] = Field(None, description="How many seasons? (if applicable)")
    streaming_services: Optional[list[str]] = Field(None, description="Where it's streaming")

class ListVideos(BaseModel):
    videos: list[Video]

class VideoRequest(BaseModel):
    title: str = Field(..., description="The title of the video to find recommendations for")
    media_type: str = Field(..., description="Type of media (Movie or TV Show)")

# Initialize Gemini Model
MODEL_GEMINI: Gemini = Gemini(id="gemini-2.0-flash-exp", api_key=API_KEY_GEMINI)

# Initialize Agents
book_recommendation_agent = Agent(
    name="Shelfie",
    tools=[ExaTools(api_key=API_KEY_EXA,num_results=12,show_results=True)],
    model=MODEL_GEMINI,
    description=dedent("""\
        You are Shelfie, a passionate and knowledgeable literary curator with expertise in books worldwide! 📚

        Your mission is to help readers discover their next favorite books by providing detailed,
        personalized recommendations based on their preferences, reading history, and the latest
        in literature. You combine deep literary knowledge with current ratings and reviews to suggest
        books that will truly resonate with each reader."""),
    instructions=dedent("""\
        Approach each recommendation with these steps:

        1. Analysis Phase 📖
        - Understand reader preferences from their input
        - Consider mentioned favorite books' genre & themes, author & writing style, plot & characters
        - Factor in any specific requirements (genre, length, content warnings)

        2. Search & Curate 🔍
        - Use Exa to search for relevant books
        - Ensure diversity in recommendations, ensuring similarities by these 3 groups genre & themes, author & writing style, plot & characters
        - Verify all book data is current and accurate

        3. Detailed Information 📝
        - Book title and author
        - Type of similarity (genre & themes, author & writing style, plot & characters)
        - Publication year
        - Genre and subgenres
        - Goodreads/StoryGraph rating
        - Page count
        - Brief, engaging plot summary
        - Content advisories with emoji representing each one
        - Trigger Warning (if applicable; should be different from Content Advisories)
        - Awards and recognition
        - All Streaming services

        4. Extra Features ✨
        - Include series information if applicable
        - Mention audiobook availability
        - Note any upcoming adaptations

        Presentation Style:
        - Add emoji indicators for all genres (eg: 📚 🔮 💕 🔪)
        - Minimum 12 recommendations per query
        - Include a brief explanation for each recommendation
        - Highlight diversity in authors and perspectives
        - Note trigger warnings when relevant"""),
    markdown=False,
    response_model=ListBooks,
    add_datetime_to_instructions=True,
    show_tool_calls=True,
) 

prompt_recommendation_agent = Agent(
    name="Prompts",
    model=MODEL_GEMINI,
    description=dedent("""\
        You are a specialist in writing prompts for explore similar books."""),
    markdown=True,
    response_model=Prompts,
    add_datetime_to_instructions=True
)

video_recommendation_agent = Agent(
    name="Cinephile",
    tools=[ExaTools(api_key=API_KEY_EXA,num_results=12,show_results=True)],
    model=MODEL_GEMINI,
    description=dedent("""\
        You are Cinephile, a movie and TV show expert! 🎬📺
        Your mission is to help users discover their next favorite movies and TV shows
        You have access to a search tool that can find movies and TV shows based on keywords
        """),
    instructions=dedent("""\
        Approach each recommendation with these steps:

        1. Analysis Phase 📖
        - Understand reader preferences from their input
        - Consider mentioned favorite movie/tv shows' genre & themes, author & writing style, plot & characters
        - Factor in any specific requirements (genre, length, content warnings)

        2. Search & Curate 🔍
        - Use Exa to search for relevant movies and tv shows
        - Ensure diversity in recommendations (movies and tv shows), ensuring similarities by these 3 groups genre & themes, author & writing style, plot & characters
        - Verify all movie and tv show data is current and accurate

        3. Detailed Information 📝
        - Movie or Tv Show title, director, actors
        - Type of similarity (genre & themes, author & writing style, plot & characters)
        - Release year
        - Genre and subgenres
        - IMDB rating, The Movie DBrating
        - Runtime in minutes
        - Similar videos
        - Streaming services
        - Brief, engaging plot summary
        - Content advisories with emoji representing each one
        - Trigger Warning (if applicable; should be different from Content Advisories)
        - Qty of seasons (if applicable)
        - Awards and recognition

        4. Extra Features ✨
        - Include books  information if applicable

        Presentation Style:
        - Add emoji indicators for all genres (eg: 📚 🔮 💕 🔪)
        - Minimum 12 recommendations per query
        - Include a brief explanation for each recommendation
        - Highlight diversity in authors and perspectives
        - Note trigger warnings when relevant"""),
    response_model=ListVideos,
    markdown=True,
    add_datetime_to_instructions=True
)

# Book API Endpoints
@app.post("/books/recommendations/similar", response_model=ListBooks)
@limiter.limit("20/minute")
async def get_similar_books(
    request: Request,
    book_request: BookRequest,
    api_key: APIKey = Depends(get_api_key)
):
    try:
        prompt = f"I really enjoyed {book_request.book_title}, can you suggest similar books?"
        response = book_recommendation_agent.run(prompt, stream=False)
        # Garantir que estamos retornando o objeto ListBooks corretamente
        return response.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/books/recommendations/custom", response_model=ListBooks)
@limiter.limit("20/minute")
async def get_custom_recommendations(
    request: Request,  # Adiciona o parâmetro request
    custom_request: CustomPromptRequest,
    api_key: APIKey = Depends(get_api_key)
):
    try:
        response = book_recommendation_agent.run(custom_request.prompt, stream=False)
        return response.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/books/prompts/{book_title}", response_model=Prompts)
@limiter.limit("20/minute")
async def get_book_prompts(
    request: Request,  # Adiciona o parâmetro request
    book_title: str,
    api_key: APIKey = Depends(get_api_key)
):
    try:
        response = prompt_recommendation_agent.run(f"Book: {book_title}", stream=False)
        return response.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Video API Endpoints
@app.post("/videos/recommendations", response_model=ListVideos)
@limiter.limit("20/minute")
async def get_video_recommendations(
    request: Request,
    video_request: VideoRequest,
    api_key: APIKey = Depends(get_api_key)
):
    try:
        prompt = f"Search for {video_request.media_type} similar to {video_request.title}"
        response = video_recommendation_agent.run(prompt, stream=False)
        # Garantir que estamos retornando o objeto ListVideos corretamente
        return response.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health Check Endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
