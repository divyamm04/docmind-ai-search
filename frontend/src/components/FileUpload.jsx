import { useState } from "react";
import { api, errorMessage } from "../api";

function FileUpload({ currentName, onIndexed, onCancel }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pickFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError(`"${file.name}" isn't a PDF. Pick a .pdf file.`);
      return;
    }
    setSelectedFile(file);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Choose a PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/upload", formData);
      onIndexed(response.data);
    } catch (err) {
      setError(errorMessage(err, "Indexing failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="upload" aria-labelledby="upload-heading">
      <h1 id="upload-heading" className="title">
        {currentName ? "Replace the document" : "Start with a PDF"}
      </h1>
      <p className="lede">
        {currentName ? (
          <>
            Indexing a new PDF replaces <cite>{currentName}</cite>. Questions
            are answered from one document at a time.
          </>
        ) : (
          <>
            Upload a PDF with selectable text, then ask questions about it.
            Each answer lists the pages it was drawn from.
          </>
        )}
      </p>

      <label
        className={`dropzone${dragging ? " is-dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="visually-hidden"
          disabled={loading}
          onChange={(e) => pickFile(e.target.files[0])}
        />
        <span className="dropzone-title">
          {selectedFile ? selectedFile.name : "Choose a PDF"}
        </span>
        <span className="dropzone-hint">
          {selectedFile
            ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB. Click to pick a different file.`
            : "or drop it here"}
        </span>
      </label>

      <div className="upload-actions">
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !selectedFile}
          className="btn-primary"
        >
          {loading ? "Indexing…" : "Index this PDF"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-quiet"
          >
            Keep {currentName}
          </button>
        )}
      </div>

      {loading && (
        <p className="status" role="status">
          Extracting text and building the search index. Long PDFs can take a
          minute.
        </p>
      )}
      {error && (
        <p className="note-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

export default FileUpload;
