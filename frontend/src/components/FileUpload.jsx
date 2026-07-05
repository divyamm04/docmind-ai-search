import React, { useState } from "react";
import axios from "axios";

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setResult(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="upload-block">
        <div className="sidebar-section-label">Document</div>

        <label className="dropzone">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <span className="dropzone-icon">📄</span>
          <span className="dropzone-title">Choose a PDF</span>
          <span className="dropzone-hint">or drop it here</span>
        </label>

        {selectedFile && (
          <div className="selected-file-chip">{selectedFile.name}</div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%" }}
        >
          {loading ? "Indexing…" : "Upload & Index"}
        </button>

        {error && <p className="inline-error">{error}</p>}
      </div>

      {result && (
        <div className="doc-card">
          <span className="doc-card-icon">📄</span>
          <div style={{ minWidth: 0 }}>
            <div className="doc-card-name">{result.filename}</div>
            <div className="doc-card-status">Indexed</div>
          </div>
        </div>
      )}

      <div>
        <div className="sidebar-section-label">Stats</div>
        <div className="stats-grid">
          <div className="stat-tile">
            <div className="stat-tile-label">Pages</div>
            <div className="stat-tile-value">
              {result ? result.pages : "—"}
            </div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-label">Chunks</div>
            <div className="stat-tile-value">
              {result ? result.chunks : "—"}
            </div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-label">Embedding Model</div>
            <div className="stat-tile-value">MiniLM-L6-v2</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-label">LLM Used</div>
            <div className="stat-tile-value">Gemini 2.5 Flash</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FileUpload;
