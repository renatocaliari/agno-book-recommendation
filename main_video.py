from pydantic import BaseModel, Field
from agno.tools.exa import ExaTools
from agno.agent import Agent, RunResponse
from agno.models.google import Gemini

from typing import Optional
import streamlit as st
from textwrap import dedent
import os
from decimal import Decimal
import requests
from dotenv import load_dotenv
import pandas as pd



load_dotenv()

API_KEY_GEMINI = os.getenv('API_KEY_GEMINI')
API_KEY_EXA = os.getenv('API_KEY_EXA')

API_KEY_TMDB = os.getenv('API_KEY_TMDB')


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
    videos: list[Video]

def search_tmdb(query: str, media_type: str) -> str:
    """Searches TMDB for movies or TV shows based on the query."""
    url = f"https://api.themoviedb.org/3/search/{media_type}?query={query}&amp;api_key={API_KEY_TMDB}"
    print("vai chamar")
    response = requests.get(url)
    print(response)
    return response.text

video_recommendation_agent = Agent(
    name="Cinephile",
    # tools=[search_tmdb],
    tools=[ExaTools(api_key=API_KEY_EXA,num_results=12,show_results=True)],
    model=Gemini(api_key=API_KEY_GEMINI),
    description=dedent("""\
        You are Cinephile, a movie and TV show expert! 🎬📺
        Your mission is to help users discover their next favorite movies and TV shows
        You have access to a search tool that can find movies and TV shows based on keywords
        """),
    # instructions=dedent("""\
    #     1. Understand user preferences.
    #     2. Use the search_tmdb tool to search for relevant movies or TV shows.
    #     3. Provide detailed information about each recommendation.
    #     """),
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
        - Content advisories
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

# Placeholder for the prompt recommendation agent (will be implemented later)
# prompt_recommendation_agent = Agent(...)

st.set_page_config(layout="wide")
st.sidebar.title("Video Recommendation")

# Basic UI for now (will be expanded later)
media_type = st.sidebar.radio("Select media type:", ("Movie", "TV Show"))
video_title = st.sidebar.text_input("Enter a movie or TV show title:")

if st.sidebar.button("Search"):
    st.write(f"Searching for {media_type} similar to {video_title}...")

    with st.spinner("Searching..."):
        response: RunResponse = video_recommendation_agent.run(
            f"Search for {media_type} similar to {video_title}", stream=False
        )
        data = response.content  # Access the books list directly
        print('data:')
        print(data)
        list_videos: ListVideos = data.videos
        df = pd.DataFrame([video.model_dump() for video in list_videos])
        df.round(2)

        st.dataframe(df)

        # st.write(response.content)