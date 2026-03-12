'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'
import React from 'react'

interface MarkdownRendererProps {
  content: string
}

export const slugifyHeading = (text: string) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/--+/g, '-')

function makeHeading(level: number) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'
  return function HeadingComp({ children }: { children?: React.ReactNode }) {
    const text = React.Children.toArray(children)
      .map((c) => (typeof c === 'string' ? c : ''))
      .join('')
    const id = slugifyHeading(text)
    return <Tag id={id}>{children}</Tag>
  }
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: makeHeading(1),
          h2: makeHeading(2),
          h3: makeHeading(3),
          h4: makeHeading(4),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
