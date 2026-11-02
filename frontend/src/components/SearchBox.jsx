import { useState } from "react";
import { api, errorMessage } from "../api";
import AnswerText from "./AnswerText";

// Older responses only carry the raw L2 distance; derive similarity the same
// way the backend does (unit vectors, so cosine = 1 - d / 2).
function similarityOf(result) {
  if (typeof result.similarity === "number") return result.similarity;
  return Math.max(0, Math.min(1, 1 - result.score / 2));
}

function SearchBox({ document }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError("Type a question first.");
      return;
    }

    setLoading(true);
    setError("");
    setExpandedIndex(null);

    try {
      const res = await api.post("/query", { question });
      setResponse(res.data);
    } catch (err) {
      setResponse(null);
      setError(errorMessage(err, "The question couldn't be answered."));
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const results = response?.results || [];
  const showExpanded =
    response?.expanded_query &&
    response.expanded_query.trim() !== response.question.trim();

  return (
    <>
      <form className="ask" onSubmit={handleSearch}>
        <label htmlFor="question" className="ask-label">
          Ask about <cite>{document.filename}</cite>
        </label>
        <div className="ask-row">
          <input
            id="question"
            type="text"
            autoComplete="off"
            placeholder="What does the document say about…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Asking…" : "Ask"}
          </button>
        </div>
      </form>

      {error && (
        <p className="note-error" role="alert">
          {error}
        </p>
      )}

      {loading && (
        <p className="status" role="status">
          Finding the closest passages and writing an answer…
        </p>
      )}

      {!response && !loading && !error && (
        <p className="empty">
          Answers come only from this document. When it doesn't cover a
          question, the model is told to say so instead of guessing.
        </p>
      )}

      {response && !loading && (
        <article className="answer" aria-live="polite">
          <h2 className="answer-question">{response.question}</h2>
          {showExpanded && (
            <p className="searched-as">
              Searched as “{response.expanded_query}”
            </p>
          )}

          <div className="answer-body">
            <AnswerText text={response.answer || "No answer was returned."} />
          </div>

          {results.length > 0 && (
            <section className="passages" aria-labelledby="passages-heading">
              <h3 id="passages-heading" className="passages-heading">
                Passages used ({results.length})
              </h3>

              <ol className="passage-list">
                {results.map((result, index) => {
                  const isExpanded = expandedIndex === index;
                  return (
                    <li className="passage" key={index}>
                      <span className="folio">p.&nbsp;{result.page}</span>
                      <div>
                        <p
                          id={`passage-${index}`}
                          className={`passage-text${
                            isExpanded ? " is-open" : ""
                          }`}
                        >
                          {result.text}
                        </p>
                        <div className="passage-meta">
                          <span>
                            {Math.round(similarityOf(result) * 100)}% match
                          </span>
                          <button
                            type="button"
                            className="link-btn"
                            aria-expanded={isExpanded}
                            aria-controls={`passage-${index}`}
                            onClick={() => toggleExpand(index)}
                          >
                            {isExpanded ? "Show less" : "Show full passage"}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </article>
      )}
    </>
  );
}

export default SearchBox;
