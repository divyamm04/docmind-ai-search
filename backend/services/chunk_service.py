def chunk_text(pages, chunk_size=400, overlap=100):
    chunks = []

    if not pages:
        return chunks

    for page in pages:
        page_number = page.get("page")
        text = page.get("text", "")

        if not text or not text.strip():
            continue

        text = text.strip()
        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end].strip()

            if chunk:
                chunks.append({
                    "page": page_number,
                    "text": chunk
                })

            if end >= text_length:
                break

            start = end - overlap
            if start < 0:
                start = 0

    return chunks
