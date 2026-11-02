import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { api, errorMessage } from "./api";
import FileUpload from "./components/FileUpload";
import SearchBox from "./components/SearchBox";

const THEME_KEY = "docmind-theme";

function initialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage blocked: fall through to the system preference.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function App() {
  const [theme, setTheme] = useState(initialTheme);
  // The index lives on the backend and survives restarts, so ask it what is
  // loaded instead of assuming an empty workspace on every page load.
  const [doc, setDoc] = useState(null);
  const [docStatus, setDocStatus] = useState("loading");
  const [docError, setDocError] = useState("");
  const [replacing, setReplacing] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Not persisted; the toggle still works for this visit.
    }
  }, [theme]);

  const loadDocument = useCallback(() => {
    api
      .get("/document")
      .then((res) => {
        setDoc(res.data.filename ? res.data : null);
        setDocStatus("ready");
      })
      .catch((err) => {
        setDocError(errorMessage(err, "Couldn't load the current document."));
        setDocStatus("error");
      });
  }, []);

  useEffect(loadDocument, [loadDocument]);

  const retryLoad = () => {
    setDocStatus("loading");
    loadDocument();
  };

  const handleIndexed = (data) => {
    setDoc(data);
    setReplacing(false);
  };

  return (
    <div className="page">
      <header className="masthead">
        <span className="wordmark">DocMind</span>

        {doc && (
          <p className="doc-status">
            <span className="doc-name" title={doc.filename}>
              {doc.filename}
            </span>
            <span className="doc-counts">
              {doc.pages} pages, {doc.chunks} passages
            </span>
          </p>
        )}

        <div className="masthead-actions">
          {doc && !replacing && (
            <button
              type="button"
              className="btn-quiet"
              onClick={() => setReplacing(true)}
            >
              Replace PDF
            </button>
          )}
          <button
            type="button"
            className="btn-quiet"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      <main className="column">
        {docStatus === "loading" && (
          <p className="status" role="status">
            Checking for an indexed document…
          </p>
        )}

        {docStatus === "error" && (
          <div className="note-error" role="alert">
            <p>{docError}</p>
            <button type="button" className="btn-quiet" onClick={retryLoad}>
              Try again
            </button>
          </div>
        )}

        {docStatus === "ready" && (!doc || replacing) && (
          <FileUpload
            currentName={doc?.filename}
            onIndexed={handleIndexed}
            onCancel={doc ? () => setReplacing(false) : null}
          />
        )}

        {docStatus === "ready" && doc && !replacing && (
          <SearchBox key={`${doc.filename}-${doc.chunks}`} document={doc} />
        )}
      </main>

      <footer className="colophon">
        Passages are retrieved with all-MiniLM-L6-v2 embeddings. Answers are
        written by Gemini 2.5 Flash from those passages.
      </footer>
    </div>
  );
}

export default App;
