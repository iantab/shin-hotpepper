import { useState } from "react";
import { searchRestaurants, type Restaurant } from "./hotpepper";
import { translateGenre } from "./genres";
import { translateToEnglish } from "./translate";
import "./App.css";

function App() {
  const [keyword, setKeyword] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [translatedAccess, setTranslatedAccess] = useState<Map<string, string>>(
    new Map(),
  );
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());

  async function handleTranslateAccess(id: string, access: string) {
    setTranslatingIds((prev) => new Set(prev).add(id));
    const translated = await translateToEnglish(access);
    setTranslatedAccess((prev) => new Map(prev).set(id, translated));
    setTranslatingIds((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    setRestaurants([]);
    setTotal(null);
    try {
      const data = await searchRestaurants({
        keyword,
        large_area: "Z011",
        count: 10,
      });
      if (data.results.error) {
        setError(data.results.error[0].message);
      } else {
        setRestaurants(data.results.shop ?? []);
        setTotal(data.results.results_available);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <h1>🍜 Gourmet English – HotPepper API Test</h1>
      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
      >
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search restaurants (e.g. sushi, ramen...)"
          style={{ flex: 1, padding: "0.5rem", fontSize: "1rem" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {total !== null && (
        <p>
          Found <strong>{total}</strong> results (showing {restaurants.length})
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {restaurants.map((r) => {
          const isTranslating = translatingIds.has(r.id);
          const translated = translatedAccess.get(r.id);
          return (
            <li
              key={r.id}
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1.5rem",
                borderBottom: "1px solid #eee",
                paddingBottom: "1rem",
              }}
            >
              {r.photo.mobile.l && (
                <img
                  src={r.photo.mobile.l}
                  alt={r.name}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              )}
              <div>
                <h3 style={{ margin: 0 }}>
                  <a href={r.urls.pc} target="_blank" rel="noopener noreferrer">
                    {r.name}
                  </a>
                </h3>
                <p style={{ margin: "0.25rem 0", color: "#555" }}>
                  {translateGenre(r.genre.code)} · 📍{" "}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name} ${r.address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: "#fef08a",
                      color: "#1a1a1a",
                      textDecoration: "none",
                      padding: "1px 4px",
                      borderRadius: 3,
                      fontWeight: 500,
                    }}
                  >
                    {r.address}
                  </a>
                </p>
                <p
                  style={{
                    margin: "0.25rem 0",
                    color: "#555",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  🚉{" "}
                  {translated ? (
                    translated
                  ) : (
                    <>
                      {!isTranslating && (
                        <button
                          onClick={() => handleTranslateAccess(r.id, r.access)}
                          style={{
                            fontSize: "0.75rem",
                            padding: "3px 10px",
                            borderRadius: 4,
                            border: "none",
                            background: "#2563eb",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          🗺 Directions
                        </button>
                      )}
                      {isTranslating && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontSize: "0.85rem",
                            color: "#888",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ animation: "spin 1s linear infinite" }}
                          >
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                          Translating…
                        </span>
                      )}
                    </>
                  )}{" "}
                  · 💴 {r.budget.average}
                </p>
                <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                  {r.catch}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
