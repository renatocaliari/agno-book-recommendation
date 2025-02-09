"use client"

import { useState } from "react"
import type { MediaType } from "../types"
import { Book, Film, Tv, Loader2, HelpCircle, ChevronRight } from "lucide-react"
import type React from "react"
import { Button } from "../../components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"

type SearchFormProps = {
  onSearch: (query: string, mediaType: MediaType, isCustomPrompt: boolean) => void;
}

const PROMPT_EXAMPLES = {
  book: {
    "Genre-specific queries": [
      "Recommend contemporary literary fiction like 'Beautiful World, Where Are You'",
      "What are the best fantasy series completed in the last 5 years?",
      "Find me atmospheric gothic novels like 'Mexican Gothic' and 'Ninth House'",
      "What are the most acclaimed debut novels from this year?"
    ],
    "Contemporary Issues": [
      "Suggest books about climate change that aren't too depressing",
      "What are the best books about artificial intelligence for non-technical readers?",
      "Recommend memoirs about immigrant experiences",
      "Find me books about mental health with hopeful endings"
    ],
    "Book Club Selections": [
      "What are good book club picks that spark discussion?",
      "Suggest literary fiction under 350 pages",
      "Find thought-provoking novels that tackle current social issues",
      "Recommend books with multiple perspectives/narratives"
    ],
    "Upcoming Releases": [
      "What are the most anticipated literary releases next month?",
      "Show me upcoming releases from my favorite authors",
      "What debut novels are getting buzz this season?",
      "List upcoming books being adapted for screen"
    ]
  },
  movie: {
    "Genre-specific queries": [
      "Recommend indie romance movies like '500 Days of Summer' but with a happier ending.",
      "What are the best animated fantasy movies released in the last 2 years?",
      "Find me suspenseful thriller movies similar to 'Prisoners' and 'Zodiac'.",
      "What are the most award-winning international films from this year?"
    ],
    "Contemporary Issues": [
      "Suggest movies about environmental activism that are inspiring.",
      "What are the best movies about the ethics of technology and surveillance?",
      "Recommend documentaries about the refugee crisis in South America.",
      "Find me movies about overcoming personal adversity with uplifting messages."
    ],
    "Movie Club Selections": [
      "What are good movie club picks that will lead to interesting discussions?",
      "Suggest movies under 2 hours for a weeknight viewing.",
      "Find thought-provoking dramas that tackle complex family dynamics.",
      "Recommend movies with unexpected plot twists and turns."
    ],
    "Upcoming Releases": [
      "What are the most anticipated horror movie releases for Halloween?",
      "Show me upcoming movies directed by Greta Gerwig.",
      "What debut films are getting positive early reviews this summer?",
      "List upcoming movies based on true historical events."
    ]
  },
  "tv show": {
    "Genre-specific queries": [
      "Recommend sci-fi TV shows like 'Battlestar Galactica' but more optimistic.",
      "What are the best fantasy TV series that concluded in the last 3 years?",
      "Find me dark comedy TV shows similar to 'Fleabag' and 'Barry'.",
      "What are the most critically acclaimed limited series from this year?"
    ],
    "Contemporary Issues": [
      "Suggest TV shows about climate change that are informative but not preachy.",
      "What are the best TV shows about social media's impact on society?",
      "Recommend documentaries about the immigrant experience in Europe.",
      "Find me TV shows about mental health that offer diverse perspectives."
    ],
    "TV Show Club Selections": [
      "What are good TV show club picks that encourage debate?",
      "Suggest limited series under 8 episodes for a quick watch.",
      "Find thought-provoking TV shows that explore current political issues.",
      "Recommend ensemble cast TV shows with strong character development."
    ],
    "Upcoming Releases": [
      "What are the most anticipated sci-fi/fantasy TV show releases next season?",
      "Show me upcoming TV shows from the creators of 'The Wire'.",
      "What debut TV shows are generating buzz this fall?",
      "List upcoming TV shows based on popular book series."
    ]
  }
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [query, setQuery] = useState("")
  const [mediaType, setMediaType] = useState<MediaType>("book")
  const [isLoading, setIsLoading] = useState(false)
  const [isCustomPrompt, setIsCustomPrompt] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSearch(query, mediaType, isCustomPrompt)
    } finally {
      setIsLoading(false)
    }
  }

  const mediaTypes: { type: MediaType; icon: React.ReactNode; label: string }[] = [
    { type: "book", icon: <Book size={24} />, label: "Book" },
    { type: "movie", icon: <Film size={24} />, label: "Movie" },
    { type: "tv show", icon: <Tv size={24} />, label: "TV Show" },
  ]

  const handleExampleClick = (example: string) => {
    setQuery(example)
    setIsPopoverOpen(false)
  }

  const renderPromptExamples = () => (
    <div className="text-sm">
      {Object.entries(PROMPT_EXAMPLES[mediaType]).map(([category, examples]) => (
        <div key={category} className="mb-4">
          <h4 className="font-bold mb-2">{category}</h4>
          <ul className="list-disc pl-4">
            {examples.map((example, index) => (
              <li 
                key={index} 
                className="mb-1 cursor-pointer hover:text-gray-600"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
      <div className="flex flex-col gap-4">
        {/* Botões de tipo de mídia */}
        <div className="flex flex-col sm:flex-row gap-2">
          {mediaTypes.map(({ type, icon, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => setMediaType(type)}
              className={`flex-1 p-2 flex items-center justify-center gap-2 text-lg sm:text-xl border-4 transition-all duration-200 ${
                mediaType === type
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-gray-100"
              }`}
            >
              {icon}
              <span className="inline">{label}</span>
            </button>
          ))}
        </div>
        {/* Campo de busca e botão */}
        <div className="flex flex-col sm:flex-row gap-2 relative">
          <div className="flex-grow relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isCustomPrompt ? "Enter your custom question..." : `Enter ${mediaType} title...`}
              className="w-full p-2 text-lg sm:text-xl border-4 border-black min-w-0 pr-10 h-[58px]"
            />
            {isCustomPrompt && (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={(e) => e.preventDefault()}
                  >
                    <HelpCircle className="h-6 w-6 text-gray-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  side="right" 
                  className="w-96 p-4 max-h-[80vh] overflow-y-auto"
                  sideOffset={20}
                >
                  {renderPromptExamples()}
                </PopoverContent>
              </Popover>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="p-2 text-lg sm:text-xl bg-black text-white hover:bg-gray-800 h-[58px] w-full sm:w-[200px] rounded-none border-4 border-black"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setIsCustomPrompt(!isCustomPrompt)}
          className="flex items-center gap-2 text-sm font-medium transition-all duration-200"
        >
          <ChevronRight 
            className={`h-4 w-4 transition-transform duration-200 ${
              isCustomPrompt ? "rotate-90" : ""
            }`}
          />
          <span className={`${
            isCustomPrompt 
              ? "text-black font-semibold" 
              : "text-gray-500 hover:text-black"
          }`}>
            Advanced: Custom Question
          </span>
        </button>
      </div>
    </form>
  )
}

