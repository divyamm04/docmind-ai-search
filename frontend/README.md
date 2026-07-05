# 📄 DocMind AI

An AI-powered PDF Question Answering application built using Retrieval-Augmented Generation (RAG).

Upload any PDF, ask natural language questions, and receive context-aware answers generated using **Google Gemini**, grounded in the contents of your document.

---

## 🚀 Features

- 📄 Upload PDF documents
- 📚 Automatic text extraction using PyMuPDF
- ✂️ Intelligent text chunking
- 🧠 Semantic embeddings using Sentence Transformers
- 🗂️ FAISS vector database for fast similarity search
- 🤖 AI-generated answers using Google Gemini
- 🔎 Source chunk retrieval with page references
- 🌐 Modern React frontend with FastAPI backend

---

## 🛠️ Tech Stack

### Frontend
- React
- Axios
- CSS

### Backend
- FastAPI
- PyMuPDF
- Sentence Transformers (all-MiniLM-L6-v2)
- FAISS
- Google Gemini API
- Python

---

## 🏗️ Architecture

```text
                PDF Upload
                     │
                     ▼
          Text Extraction (PyMuPDF)
                     │
                     ▼
               Text Chunking
                     │
                     ▼
      Sentence Transformer Embeddings
                     │
                     ▼
            FAISS Vector Database
                     │
                     ▼
            Semantic Retrieval
                     │
                     ▼
          Google Gemini (LLM)
                     │
                     ▼
          Context-aware Answer
```

---

## 📸 Screenshots

### Home
![Home](screenshots/home.png)

### Upload Successful
![Upload](screenshots/upload-success.png)

### AI Answer
![Answer](screenshots/ai-answer.png)

---

## ⚙️ Installation

### Clone the repository

```bash
git clone <your-repository-url>
cd docmind-ai-search
```

### Backend

```bash
cd backend
pip install -r requirements.txt
py -m uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 💡 How It Works

1. Upload a PDF document.
2. The backend extracts text from the PDF.
3. The text is split into smaller chunks.
4. Each chunk is converted into a semantic embedding.
5. Embeddings are stored in a FAISS vector index.
6. User questions are embedded and matched against the most relevant chunks.
7. Retrieved context is sent to Google Gemini to generate a grounded answer.
8. The answer and supporting source passages are displayed in the frontend.

---

## 📈 Future Improvements

- Multiple document support
- Hybrid search (BM25 + Vector Search)
- Better chunking strategy
- Highlight answer location inside PDF
- User authentication
- Cloud deployment
- Streaming AI responses

---

## 👨‍💻 Author

**Divyam Joshi**

MIT Manipal