"use client";

import React from "react";

interface Props {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: Props) {
  // Split lines
  const lines = content.split("\n");

  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-outside pl-4 space-y-1 my-1.5 text-xs">
          {listBuffer.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderFormattedInline(item)}
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const flushCode = () => {
    if (codeBuffer.length > 0) {
      elements.push(
        <pre
          key={`code-${elements.length}`}
          className="bg-slate-900 text-slate-100 dark:bg-black/80 dark:text-zinc-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto my-2 border border-slate-700/50 dark:border-zinc-800"
        >
          <code>{codeBuffer.join("\n")}</code>
        </pre>
      );
      codeBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Unordered list
    if (/^\s*[-*•]\s+/.test(line)) {
      const text = line.replace(/^\s*[-*•]\s+/, "");
      listBuffer.push(text);
      continue;
    } else {
      flushList();
    }

    // Numbered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const text = line.replace(/^\s*\d+\.\s+/, "");
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 my-1 text-xs">
          <span className="font-mono text-[10px] font-bold text-indigo-500 shrink-0 mt-0.5">
            {line.match(/^\s*(\d+\.)/)?.[1]}
          </span>
          <span className="flex-1 leading-relaxed">{renderFormattedInline(text)}</span>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`blank-${i}`} className="h-1.5" />);
      continue;
    }

    // Horizontal Rule
    if (/^---|^___|^\*\*\*/.test(line.trim())) {
      elements.push(
        <hr key={`hr-${i}`} className="my-2.5 border-slate-200 dark:border-zinc-800" />
      );
      continue;
    }

    // Headings
    if (line.startsWith("#### ")) {
      elements.push(
        <h5 key={`h5-${i}`} className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mt-2 mb-1">
          {renderFormattedInline(line.replace("#### ", ""))}
        </h5>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={`h4-${i}`} className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mt-2.5 mb-1 flex items-center gap-1.5">
          {renderFormattedInline(line.replace("### ", ""))}
        </h4>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={`h3-${i}`} className="font-bold text-sm text-slate-900 dark:text-white mt-3 mb-1.5">
          {renderFormattedInline(line.replace("## ", ""))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h2 key={`h2-${i}`} className="font-extrabold text-base text-slate-900 dark:text-white mt-3 mb-2">
          {renderFormattedInline(line.replace("# ", ""))}
        </h2>
      );
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs leading-relaxed my-1">
        {renderFormattedInline(line)}
      </p>
    );
  }

  flushList();
  flushCode();

  return <div className={className}>{elements}</div>;
}

/**
 * Handles inline markdown: bold, italic, inline code, links
 */
function renderFormattedInline(text: string): React.ReactNode {
  // Regex to split by markdown tokens
  const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);

  return tokens.map((token, index) => {
    // Bold
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    // Italic
    if (token.startsWith("*") && token.endsWith("*") && !token.startsWith("**")) {
      return (
        <em key={index} className="italic text-slate-600 dark:text-zinc-300">
          {token.slice(1, -1)}
        </em>
      );
    }
    // Inline code
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={index}
          className="font-mono text-[11px] bg-slate-200/70 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 px-1 py-0.5 rounded border border-slate-300/60 dark:border-zinc-700 font-semibold"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    // Link
    if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const match = token.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a
            key={index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            {match[1]}
          </a>
        );
      }
    }

    return token;
  });
}

