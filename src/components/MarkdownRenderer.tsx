'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-slate max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-600 dark:text-gray-400">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-600 dark:text-gray-400">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="mb-1">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 dark:bg-blue-900/20 py-2 my-4 text-gray-700 dark:text-gray-300">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-gray-900 dark:bg-gray-800 text-gray-100 dark:text-gray-200 p-4 rounded-lg overflow-x-auto mb-4">
                <code>{children}</code>
              </pre>
            );
          },
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-sm my-4"
            />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left text-gray-900 dark:text-gray-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}