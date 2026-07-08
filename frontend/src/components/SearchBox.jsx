import React, { useState } from "react";
import axios from "axios";

function SearchBox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleSearch = async () => {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");
    setResults([]);
    setExpandedIndex(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/query", {
        question: question,
      });

      setAnswer(response.data.answer || "");
      setResults(response.data.results || []);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <>
      <div>
        <h1 className="workspace-heading">Ask your documents</h1>
        <p className="workspace-subheading">
          Answers are generated from the PDFs you've indexed.
        </p>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔎</span>
        <input
          type="text"
          placeholder="Ask something about your documents…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {error && <p className="inline-error">{error}</p>}
      {loading && <p className="status-text">Retrieving relevant passages…</p>}

      {answer ? (
        <div className="answer-card">
          <div className="answer-card-header">
            <span>🤖</span>
            <span>AI Answer</span>
          </div>
          <p className="answer-card-text">
  THIS IS A TEST
  <br />
  {answer}
</p>
        </div>
      ) : (
        !loading && (
          <div className="answer-placeholder">
            Ask a question to get an answer grounded in your uploaded
            documents.
          </div>
        )
      )}

      {results.length > 0 && (
        <div>
          <div className="sources-header">
            <span className="sources-title">Sources</span>
            <span className="sources-count">{results.length}</span>
          </div>

          <div className="sources-list">
            {results.map((result, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <div
                  className="citation-card"
                  key={index}
                  onClick={() => toggleExpand(index)}
                >
                  <div className="citation-card-top">
                    <div className="citation-meta">
                      <span>📄</span>
                      <span className="citation-page">
                        Page {result.page}
                      </span>
                    </div>
                    <div className="citation-right">
                      <span className="citation-score">
                        {typeof result.score === "number"
                          ? result.score.toFixed(3)
                          : result.score}
                      </span>
                      <span
                        className={`citation-chevron${
                          isExpanded ? " expanded" : ""
                        }`}
                      >
                        ▾
                      </span>
                    </div>
                  </div>
                  <p
                    className={`citation-preview${
                      isExpanded ? " expanded" : ""
                    }`}
                  >
                    {result.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default SearchBox;
