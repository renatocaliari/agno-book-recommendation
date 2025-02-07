from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
import os
from dotenv import load_dotenv
from textwrap import dedent

from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools.exa import ExaTools

# Load environment variables
load_dotenv()
API_KEY_GEMINI = os.getenv('API_KEY_GEMINI')
API_KEY_EXA = os.getenv('API_KEY_EXA')
API_KEY_TMDB = os.getenv('API_KEY_TMDB')

# Initialize FastAPI
app = FastAPI(title="Video Recommendation API")

# Models
class Video(BaseModel):
    title: str = Field(..., description="The title of the movie or TV show")
    type: str = Field(..., description="Whether it's a 'Movie' or 'TV Show'")
    explanation: str = Field(..., description="The explanation: why that movie or tv show is similar?")
    directors: Optional[list[str]] = Field(None, description="The director(s) of the movie or TV show")
    actors: list[str] = Field(..., description="The main actors in the movie or TV show")

class ListVideos(BaseModel):
    videos: List[Video]

class VideoRequest(BaseModel):
    title: str = Field(..., description="The title of the video to find recommendations for")
    media_type: str = Field(..., description="Type of media (Movie or TV Show)")

# Initialize Agent
video_recommendation_agent = Agent(
    name="Cinephile",
    tools=[ExaTools(api_key=API_KEY_EXA,num_results=12,show_results=True)],
    model=Gemini(api_key=API_KEY_GEMINI),
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

# API Endpoints
@app.post("/recommendations/video", response_model=ListVideos)
async def get_video_recommendations(request: VideoRequest):
    try:
        prompt = f"Search for {request.media_type} similar to {request.title}"
        response = video_recommendation_agent.run(prompt, stream=False)
        return response.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
