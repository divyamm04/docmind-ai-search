import React from "react";

const BULLET = /^\s*([-*•]|\d+[.)])\s+/;

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

// Gemini answers in light markdown: paragraphs, bullet or numbered lists and
// **bold**. Render just that subset as elements so raw asterisks never show.
function AnswerText({ text }) {
  const blocks = [];
  let current = null;

  for (const line of text.split("\n")) {
    if (!line.trim()) {
      current = null;
      continue;
    }

    const isItem = BULLET.test(line);
    const type = isItem ? (/^\s*\d/.test(line) ? "ol" : "ul") : "p";

    if (!current || current.type !== type) {
      current = { type, lines: [] };
      blocks.push(current);
    }
    current.lines.push(isItem ? line.replace(BULLET, "") : line.trim());
  }

  return blocks.map((block, i) => {
    if (block.type === "p") {
      return (
        <p key={i}>
          {block.lines.map((line, j) => (
            <React.Fragment key={j}>
              {j > 0 && <br />}
              {renderInline(line)}
            </React.Fragment>
          ))}
        </p>
      );
    }

    const List = block.type;
    return (
      <List key={i}>
        {block.lines.map((line, j) => (
          <li key={j}>{renderInline(line)}</li>
        ))}
      </List>
    );
  });
}

export default AnswerText;
