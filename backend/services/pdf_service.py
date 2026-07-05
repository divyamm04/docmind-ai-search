import fitz


def extract_text_from_pdf(file_path: str):
    pages = []

    try:
        doc = fitz.open(file_path)

        for page_number, page in enumerate(doc, start=1):
            try:
                text = page.get_text()
            except Exception:
                text = ""

            pages.append({
                "page": page_number,
                "text": text
            })

        doc.close()

    except Exception as e:
        print(f"Error reading PDF '{file_path}': {e}")
        return []

    return pages
