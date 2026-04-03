import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function MarkdownRenderer({ content, className = '', style }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`} style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Стилизация заголовков
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-2 mt-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-2 mt-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2 mt-2" {...props} />,
          // Стилизация параграфов
          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          // Стилизация списков
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="ml-2" {...props} />,
          // Стилизация кода
          code: ({ node, inline, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-black/20 text-sm font-mono"
                  {...props}
                />
              );
            }
            return (
              <code
                className="block p-3 rounded-lg bg-black/20 text-sm font-mono overflow-x-auto mb-2"
                {...props}
              />
            );
          },
          // Стилизация блоков кода
          pre: ({ node, ...props }) => (
            <pre className="mb-2 overflow-x-auto" {...props} />
          ),
          // Стилизация ссылок
          a: ({ node, ...props }: any) => (
            <a
              className="underline hover:opacity-80 transition-opacity"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          // Стилизация выделения текста
          strong: ({ node, ...props }) => (
            <strong className="font-bold" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic" {...props} />
          ),
          // Стилизация цитат
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 pl-4 my-2 opacity-80 italic"
              {...props}
            />
          ),
          // Стилизация горизонтальной линии
          hr: ({ node, ...props }) => (
            <hr className="my-4 border-t border-current opacity-20" {...props} />
          ),
          // Стилизация таблиц
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-2">
              <table className="border-collapse border border-current/20" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-black/10" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-current/20 px-2 py-1 text-left font-bold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-current/20 px-2 py-1" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
