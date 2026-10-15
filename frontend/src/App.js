import { useState, useEffect } from "react";
import axios from "axios";

// API key aur backend URL frontend/.env se aa rahe hain
const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// --- NEW COMPONENT: MOVIE CARD WITH POSTER ---
function MovieCard({ m, isSelected, onClick }) {
  const [poster, setPoster] = useState(null);

  useEffect(() => {
    // API se poster mangwa rahe hain
    const getPoster = async () => {
      if (!OMDB_API_KEY) return; // Agar .env mein key nahi dali toh skip
      try {
        const res = await axios.get(
          `https://www.omdbapi.com/?t=${encodeURIComponent(m.title)}&apikey=${OMDB_API_KEY}`,
        );
        if (res.data.Poster && res.data.Poster !== "N/A") {
          setPoster(res.data.Poster);
        }
      } catch (err) {
        console.error("Poster fetch error:", err);
      }
    };
    getPoster();
  }, [m.title]);

  return (
    <div
      onClick={() => onClick(m, poster)} // Click hone par poster aur details dono bhej raha hai
      className={`group rounded-xl border cursor-pointer overflow-hidden transition-all duration-300 relative flex flex-col ${
        isSelected
          ? "bg-[#2a2a2a] border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)] -translate-y-2"
          : "bg-[#1a1a1a] border-gray-800 hover:border-gray-500 hover:-translate-y-1"
      }`}
    >
      <div className="aspect-[2/3] w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-5xl relative overflow-hidden">
        {poster ? (
          <img
            src={poster}
            alt={m.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
          />
        ) : (
          <span
            className={`transition-all duration-300 ${isSelected ? "opacity-100 scale-110" : "opacity-40 group-hover:scale-110"}`}
          >
            🎬
          </span>
        )}

        {/* Title Overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end justify-center text-center min-h-[50%]">
          <h2
            className={`font-bold text-sm md:text-base transition-colors z-10 ${isSelected ? "text-yellow-400" : "text-gray-100 group-hover:text-white"}`}
          >
            {m.title}
          </h2>
        </div>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
function App() {
  const [isCoupleMode, setIsCoupleMode] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [prompt1, setPrompt1] = useState("");
  const [prompt2, setPrompt2] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedPoster, setSelectedPoster] = useState(null); // Poster state

  const handleMovieSelect = (movie, poster) => {
    setSelectedMovie(movie);
    setSelectedPoster(poster);
  };

  const getRecommendations = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    setSelectedMovie(null);
    setSelectedPoster(null);

    const payload = isCoupleMode
      ? { prompt1: prompt1.trim(), prompt2: prompt2.trim() }
      : { prompt: prompt.trim() };

    try {
      const res = await axios.post(`${API_URL}/recommend`, payload);
      setRecommendations(res.data);
    } catch (err) {
      setError("Failed to fetch recommendations.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-gray-100 font-sans selection:bg-pink-500">
      <nav className="bg-[#1a1a1a] px-8 py-5 shadow-lg border-b border-gray-800 sticky top-0 z-50">
        <span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white px-3 py-1 rounded-md text-2xl font-bold">
          VibeMatch
        </span>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 mb-4">
            {isCoupleMode ? "The Vibe Compromise" : "Find Your Vibe"}
          </h2>
          <div className="flex justify-center gap-2 bg-[#1f1f1f] p-1 rounded-full w-fit mx-auto border border-gray-700">
            <button
              onClick={() => {
                setIsCoupleMode(false);
                setSelectedMovie(null);
                setRecommendations([]);
              }}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${!isCoupleMode ? "bg-yellow-400 text-black shadow-md" : "text-gray-400 hover:text-white"}`}
            >
              Single
            </button>
            <button
              onClick={() => {
                setIsCoupleMode(true);
                setSelectedMovie(null);
                setRecommendations([]);
              }}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${isCoupleMode ? "bg-pink-500 text-white shadow-md" : "text-gray-400 hover:text-white"}`}
            >
              Couple
            </button>
          </div>
        </div>

        <form onSubmit={getRecommendations} className="max-w-4xl mx-auto mb-16">
          {!isCoupleMode ? (
            <textarea
              rows="2"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vibe (e.g. 'A dark space thriller')..."
              className="w-full p-4 rounded-xl bg-[#1f1f1f] text-white border border-gray-700 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all resize-none"
            />
          ) : (
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <textarea
                rows="2"
                value={prompt1}
                onChange={(e) => setPrompt1(e.target.value)}
                placeholder="Person A's vibe..."
                className="flex-1 p-4 rounded-xl bg-[#1f1f1f] text-white border border-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none resize-none"
              />
              <div className="flex items-center justify-center font-bold text-gray-500 px-2">
                VS
              </div>
              <textarea
                rows="2"
                value={prompt2}
                onChange={(e) => setPrompt2(e.target.value)}
                placeholder="Person B's vibe..."
                className="flex-1 p-4 rounded-xl bg-[#1f1f1f] text-white border border-gray-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none"
              />
            </div>
          )}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={
                isLoading ||
                (isCoupleMode
                  ? !prompt1.trim() || !prompt2.trim()
                  : !prompt.trim())
              }
              className={`py-4 px-12 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg min-w-[200px] ${isCoupleMode ? "bg-gradient-to-r from-yellow-400 to-pink-500 text-white" : "bg-yellow-400 text-black"}`}
            >
              {isLoading ? "Consulting AI..." : "Match Vibes"}
            </button>
          </div>
        </form>

        {recommendations.length > 0 && (
          <div className="animate-fade-in-up">
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {recommendations.map((m, index) => (
                <MovieCard
                  key={index}
                  m={m}
                  isSelected={selectedMovie && selectedMovie.title === m.title}
                  onClick={handleMovieSelect}
                />
              ))}
            </div>
          </div>
        )}

        {/* --- INLINE MOVIE DESCRIPTION DIV (WITH POSTER) --- */}
        {selectedMovie && (
          <div className="mt-12 bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-700 rounded-3xl p-8 shadow-2xl relative animate-fade-in-up overflow-hidden group">
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500/10 to-pink-500/10 blur-xl opacity-50 pointer-events-none"></div>

            <button
              type="button"
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 transition-all z-50 cursor-pointer shadow-lg border border-gray-600"
              title="Close details"
            >
              ✕
            </button>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 pr-4 md:pr-12">
              {/* NEW: Poster Image inside Details Panel! */}
              {selectedPoster && (
                <div className="hidden md:block w-48 flex-shrink-0">
                  <img
                    src={selectedPoster}
                    alt={selectedMovie.title}
                    className="w-full rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-gray-700 object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                
                <h3 className="text-3xl md:text-4xl font-black mb-6 text-white tracking-tight">
                  {selectedMovie.title}
                </h3>

                <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-gray-800">
                  <h4 className="text-pink-400 text-sm font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                     Synopsis
                  </h4>
                  <p className="text-gray-300 leading-relaxed text-lg italic line-clamp-4">
                    {selectedMovie.plot !== ""
                      ? selectedMovie.plot
                      : "We knows the vibe, but couldn't find a written plot for this one!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
