from pydantic import BaseModel, HttpUrl, Field
from typing import Optional
import streamlit as st
from textwrap import dedent
import os
from dotenv import load_dotenv


load_dotenv() 

API_KEY_GEMINI = os.getenv('API_KEY_GEMINI')
API_KEY_EXA = os.getenv('API_KEY_EXA')

from agno.agent import Agent, RunResponse
from agno.models.google import Gemini
from agno.tools.exa import ExaTools

from decimal import Decimal
import pandas as pd


MODEL_GEMINI: Gemini = Gemini(id="gemini-2.0-flash-exp", api_key=API_KEY_GEMINI)


class Prompts(BaseModel):
    prompts: list[str] = Field(default_factory=list, description="A list of prompts")  # Use default_factory

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
    # cover_url: Optional[HttpUrl] = Field(None, description="The cover URL") # Make cover_url optional
class ListBooks(BaseModel):
    books: list[Book]


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
        - Content advisories
        - Awards and recognition

        4. Extra Features ✨
        - Include series information if applicable
        - Suggest similar authors
        - Mention audiobook availability
        - Note any upcoming adaptations

        Presentation Style:
        - Add emoji indicators for all genres (eg: 📚 🔮 💕 🔪)
        - Minimum 12 recommendations per query
        - Include a brief explanation for each recommendation
        - Highlight diversity in authors and perspectives
        - Note trigger warnings when relevant"""),
    markdown=False,
    response_model=ListBooks,  # Correct response model
    add_datetime_to_instructions=True,
    show_tool_calls=True,
)

prompt_recommendation_agent = Agent(
    name="Shelfie",
    model=MODEL_GEMINI,
    description=dedent("""\
        You are a specialist in writing prompts for books related specifically to the book user give you.
    """),
    instructions=["List specific prompts for an LLM to find books related to the book title provided by the user",
                  "Give different prompts, some related to genre & themes, author & writing style, and plot & characters, of the book user give you",
                  "Be specific about the details, do not user placeholder or general things: name of the book, genre, theme, author, writing style, plot or characters"
    ],
    markdown=False,
    response_model=Prompts,  # Correct response model
    add_datetime_to_instructions=True
)

prompt = ""
book_title = ""

if "prompts_list" not in st.session_state:
    st.session_state.prompts_list = []  # Inicializa a lista de prompts

st.set_page_config(layout="wide")
st.sidebar.title("Book Recommendation")

if st.sidebar.button("Search"):
    with st.spinner("Searching for recommendations... 🔍"):
        try:
            response: RunResponse = book_recommendation_agent.run(prompt, stream=False)
            data = response.content  # Access the books list directly

            list_books: ListBooks = data.books
            df = pd.DataFrame([book.model_dump() for book in list_books])
            df.round(2)

            st.dataframe(df)
        except Exception as e:  # Catch any exception for better error handling
            st.error(f"Error during book recommendation: {e}")
            st.text(f"Raw response: {response.content if 'response' in locals() else 'No response'}") # Debugging


        try:
            response_prompts: RunResponse = prompt_recommendation_agent.run(f"{book_title}", stream=False, markdown=False)
            st.session_state.prompts_list = response_prompts.content.prompts if response_prompts.content else [] # Handle no contentpts na sessão

        except Exception as e:
            st.error(f"Error during prompt generation: {e}")
            st.text(f"Raw response: {response_prompts.content if 'response_prompts' in locals() else 'No response'}") # Debugging



prompt_options = ["Find similar books", "Enter custom prompt"]
prompt_options.extend(st.session_state.prompts_list)  # Extend *after* potential errors

# Radio button to choose between finding similar books and entering a custom prompt
choice = st.sidebar.radio("Choose an option:", prompt_options)

if choice == "Find similar books":
    book_title = st.sidebar.text_input("Enter the book title:")
    prompt = f"I really enjoyed {book_title}, can you suggest similar books?"
elif choice == "Enter custom prompt":
    prompt = st.sidebar.text_area("Enter your custom prompt:", height=100)
else:
    prompt = choice

# Ensure the "Search" button is always visible at the bottom of the sidebar
st.sidebar.markdown("""
    <style>
    .stButton {
        position: fixed;
        bottom: 10px;
        width: 100%;
    }
    </style>
    """, unsafe_allow_html=True)

# Display example prompts conditionally
if choice == "Enter custom prompt":
    st.sidebar.markdown("### Example Prompts")
    st.sidebar.markdown("""
    Genre-specific queries:
    1. "Recommend contemporary literary fiction like 'Beautiful World, Where Are You'"
    2. "What are the best fantasy series completed in the last 5 years?"
    3. "Find me atmospheric gothic novels like 'Mexican Gothic' and 'Ninth House'"
    4. "What are the most acclaimed debut novels from this year?"

    Contemporary Issues:
    1. "Suggest books about climate change that aren't too depressing"
    2. "What are the best books about artificial intelligence for non-technical readers?"
    3. "Recommend memoirs about immigrant experiences"
    4. "Find me books about mental health with hopeful endings"

    Book Club Selections:
    1. "What are good book club picks that spark discussion?"
    2. "Suggest literary fiction under 350 pages"
    3. "Find thought-provoking novels that tackle current social issues"
    4. "Recommend books with multiple perspectives/narratives"

    Upcoming Releases:
    1. "What are the most anticipated literary releases next month?"
    2. "Show me upcoming releases from my favorite authors"
    3. "What debut novels are getting buzz this season?"
    4. "List upcoming books being adapted for screen"
    """)
