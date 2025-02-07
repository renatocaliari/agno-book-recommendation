from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
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

app = FastAPI(title="Media Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Você ajustará isso depois
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models for Books
class Book(BaseModel):
    title: str = Field(..., description="The title of the book")
    author: str = Field(..., description="The author of the book")
    similarity_type: str = Field(..., description="The type of similarity")
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
    similar_authors: Optional[list[str]] = Field(None, description="The similar authors")
    audiobook_available: Optional[bool] = Field(None, description="Audiobook availability")
    upcoming_adaptations: Optional[str] = Field(None, description="Upcoming adaptations")
    diversity_highlight: Optional[str] = Field(None, description="Diversity highlight")
    trigger_warnings: Optional[list[str]] = Field(None, description="Trigger warnings")

class ListBooks(BaseModel):
    books: List[Book]

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
    explanation: str = Field(..., description="The explanation: why that movie or tv show is similar?")
    directors: Optional[list[str]] = Field(None, description="The director(s) of the movie or TV show")
    actors: list[str] = Field(..., description="The main actors in the movie or TV show")
    genre: list[str] = Field(..., description="The genre(s) of the movie or TV show, starting with emojis")
    release_year: int = Field(..., description="The release year")
    plot_summary: str = Field(..., description="A brief summary of the plot")
    imdb_rating: Optional[Decimal] = Field(None, description="The IMDB rating")
    tmdb_rating: Optional[Decimal] = Field(None, description="The TMDB rating")
    runtime: Optional[int] = Field(None, description="The runtime in minutes")
    content_advisories: Optional[list[str]] = Field(None, description="Content advisories")
    awards: Optional[list[str]] = Field(None, description="Awards won")
    series_season: Optional[str] = Field(None, description="How many seasons? (if applicable)")
    similar_videos: Optional[list[str]] = Field(None, description="Similar movies or TV shows")
    streaming_services: Optional[list[str]] = Field(None, description="Where it's streaming")

class ListVideos(BaseModel):
    videos: List[Video]

class VideoRequest(BaseModel):
    title: str = Field(..., description="The title of the video to find recommendations for")
    media_type: str = Field(..., description="Type of media (Movie or TV Show)")

# Initialize Gemini Model
MODEL_GEMINI = Gemini(id="gemini-2.0-flash-exp", api_key=API_KEY_GEMINI)

# Initialize Agents
book_recommendation_agent = Agent(
    name="Shelfie",
    tools=[ExaTools(api_key=API_KEY_EXA,num_results=12,show_results=True)],
    model=MODEL_GEMINI,
    description=dedent("""\
        You are Shelfie, a passionate and knowledgeable literary curator with expertise in books worldwide! 📚
        Your mission is to help readers discover their next favorite books by providing detailed,
        personalized recommendations based on their preferences, reading history, and the latest
        in literature."""),
    instructions=dedent("""\
        Approach each recommendation with these steps:
        1. Analysis Phase 📖
        2. Search & Curate 🔍
        3. Detailed Information 📝
        4. Extra Features ✨"""),
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
        Your mission is to help users discover their next favorite movies and TV shows"""),
    instructions=dedent("""\
        Approach each recommendation with these steps:
        1. Analysis Phase 📖
        2. Search & Curate 🔍
        3. Detailed Information 📝
        4. Extra Features ✨"""),
    response_model=ListVideos,
    markdown=True,
    add_datetime_to_instructions=True
)

# Book API Endpoints
@app.post("/books/recommendations/similar", response_model=ListBooks)
async def get_similar_books(request: BookRequest):
    try:
        prompt = f"I really enjoyed {request.book_title}, can you suggest similar books?"
        response = book_recommendation_agent.run(prompt, stream=False)
        return response.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/books/recommendations/custom", response_model=ListBooks)
async def get_custom_recommendations(request: CustomPromptRequest):
    try:
        response = book_recommendation_agent.run(request.prompt, stream=False)
        return response.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/books/prompts/{book_title}", response_model=Prompts)
async def get_book_prompts(book_title: str):
    try:
        response = prompt_recommendation_agent.run(f"Book: {book_title}", stream=False)
        return response.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Video API Endpoints
@app.post("/videos/recommendations", response_model=ListVideos)
async def get_video_recommendations(request: VideoRequest):
    try:
        prompt = f"Search for {request.media_type} similar to {request.title}"
        response = video_recommendation_agent.run(prompt, stream=False)
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
