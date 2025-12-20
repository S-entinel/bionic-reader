import { useState, useEffect, useRef } from 'react'

interface ReaderProps {
  bookContent: string
  bookTitle: string
  onNewFile: () => void
}

const Reader = ({ bookContent, bookTitle, onNewFile }: ReaderProps) => {
  // Reading state
  const [scrollPosition, setScrollPosition] = useState(0)
  
  // Display preferences
  const [bionicEnabled, setBionicEnabled] = useState(true)
  const [boldPercentage, setBoldPercentage] = useState(0.5)
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(1.6)
  
  // UI state
  const [showSettings, setShowSettings] = useState(false)
  
  // Refs
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Remarkable-inspired monochrome theme
  const theme = {
    bg: '#ffffff',
    paper: '#fafafa',
    text: '#1a1a1a',
    textLight: '#666666',
    border: '#e0e0e0',
    accent: '#2a2a2a',
    shadow: 'rgba(0, 0, 0, 0.08)',
  }

  // ==================== BIONIC FORMATTING ====================
  
  const applyBionicFormatting = (html: string, percentage: number): string => {
    if (!html) return ''
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const text = node.textContent
        if (text.trim()) {
          const words = text.split(/(\s+)/)
          const formatted = words.map(word => {
            if (!word.trim()) return word
            
            const match = word.match(/^(\W*)(\w+)(\W*)$/)
            if (!match) return word
            
            const [, prefix, core, suffix] = match
            const len = core.length
            let boldCount = 1
            
            if (len <= 2) boldCount = 1
            else if (len <= 5) boldCount = 2
            else boldCount = Math.max(1, Math.floor(len * percentage))
            
            const bold = core.slice(0, boldCount)
            const regular = core.slice(boldCount)
            
            return `${prefix}<strong>${bold}</strong>${regular}${suffix}`
          }).join('')
          
          const span = doc.createElement('span')
          span.innerHTML = formatted
          node.parentNode?.replaceChild(span, node)
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        if (!['SCRIPT', 'STYLE', 'STRONG'].includes(element.tagName)) {
          Array.from(node.childNodes).forEach(processNode)
        }
      }
    }
    
    Array.from(doc.body.childNodes).forEach(processNode)
    return doc.body.innerHTML
  }

  const stripBoldTags = (html: string): string => {
    if (!html) return ''
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const strongTags = doc.querySelectorAll('strong')
    strongTags.forEach(strong => {
      const textNode = doc.createTextNode(strong.textContent || '')
      strong.parentNode?.replaceChild(textNode, strong)
    })
    return doc.body.innerHTML
  }

  // Apply formatting to the entire book
  const displayContent = bookContent 
    ? (bionicEnabled 
        ? applyBionicFormatting(bookContent, boldPercentage)
        : stripBoldTags(bookContent))
    : ''

  // ==================== PAGINATION & PROGRESS ====================
  
  const totalHeight = contentRef.current ? contentRef.current.scrollHeight : 0
  const maxScroll = scrollContainerRef.current && contentRef.current
    ? contentRef.current.scrollHeight - scrollContainerRef.current.clientHeight 
    : 0

  // Simple progress percentage based on scroll position
  const progress = maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0

  // ==================== NAVIGATION ====================

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollTop)
    }
  }

  // ==================== RENDER ====================

  if (!bookContent) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.paper,
        fontFamily: "'Charter', 'Georgia', serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📖</div>
          <div style={{ fontSize: '16px', color: theme.textLight }}>No book content loaded</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: theme.bg,
      display: 'flex',
      position: 'fixed',
      top: 0,
      left: 0,
      fontFamily: "'Charter', 'Georgia', serif",
    }}>
      
      {/* Left Sidebar - Persistent Controls */}
      <div style={{
        width: '280px',
        height: '100vh',
        background: theme.paper,
        borderRight: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 24px',
        overflowY: 'auto',
      }}>
        {/* Book Title */}
        <div style={{
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: `1px solid ${theme.border}`,
        }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 600,
            margin: 0,
            color: theme.text,
            lineHeight: 1.4,
          }}>
            {bookTitle}
          </h1>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '12px',
            color: theme.textLight,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Progress
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 600,
            color: theme.text,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {Math.round(progress)}%
          </div>
          <div style={{
            marginTop: '12px',
            height: '2px',
            background: theme.border,
            borderRadius: '1px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: theme.accent,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: showSettings ? theme.accent : 'transparent',
            color: showSettings ? theme.bg : theme.text,
            border: `1px solid ${showSettings ? theme.accent : theme.border}`,
            borderRadius: '4px',
            padding: '12px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '16px',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
        >
          {showSettings ? '✕ Close Settings' : '⚙ Settings'}
        </button>

        {/* Settings Panel */}
        {showSettings && (
          <div style={{
            paddingTop: '16px',
            borderTop: `1px solid ${theme.border}`,
          }}>
            {/* Bionic Reading Toggle */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: theme.text,
              }}>
                <input
                  type="checkbox"
                  checked={bionicEnabled}
                  onChange={(e) => setBionicEnabled(e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    cursor: 'pointer',
                    accentColor: theme.accent,
                  }}
                />
                Bionic Reading
              </label>
            </div>

            {/* Bold Percentage */}
            {bionicEnabled && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '12px', 
                  color: theme.textLight, 
                  display: 'block', 
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Bold Intensity: {Math.round(boldPercentage * 100)}%
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="0.7"
                  step="0.05"
                  value={boldPercentage}
                  onChange={(e) => setBoldPercentage(parseFloat(e.target.value))}
                  style={{ 
                    width: '100%', 
                    cursor: 'pointer',
                    accentColor: theme.accent,
                  }}
                />
              </div>
            )}

            {/* Font Size */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                fontSize: '12px', 
                color: theme.textLight, 
                display: 'block', 
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="14"
                max="24"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                style={{ 
                  width: '100%', 
                  cursor: 'pointer',
                  accentColor: theme.accent,
                }}
              />
            </div>

            {/* Line Spacing */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                fontSize: '12px', 
                color: theme.textLight, 
                display: 'block', 
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Line Spacing: {lineHeight.toFixed(1)}
              </label>
              <input
                type="range"
                min="1.4"
                max="2.2"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                style={{ 
                  width: '100%', 
                  cursor: 'pointer',
                  accentColor: theme.accent,
                }}
              />
            </div>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* New Book Button */}
        <button
          onClick={onNewFile}
          style={{
            background: 'transparent',
            color: theme.textLight,
            border: `1px solid ${theme.border}`,
            borderRadius: '4px',
            padding: '12px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.accent
            e.currentTarget.style.color = theme.accent
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border
            e.currentTarget.style.color = theme.textLight
          }}
        >
          ← New Book
        </button>
      </div>

      {/* Main Reading Area */}
      <div style={{
        flex: 1,
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        background: theme.bg,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
      ref={scrollContainerRef}
      onScroll={handleScroll}
      >
        <div style={{
          width: '100%',
          maxWidth: '720px',
          padding: '80px 60px 120px 60px',
        }}>
          <div
            ref={contentRef}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}`,
              color: theme.text,
            }}
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
        /* Smooth scrolling */
        * {
          scroll-behavior: smooth;
        }
        
        .chapter-content {
          margin-bottom: 3em;
        }
        
        p {
          margin: 1em 0;
          text-align: justify;
          text-indent: 1.5em;
        }
        
        p:first-of-type {
          text-indent: 0;
        }
        
        .chapter-content > p:first-of-type::first-letter {
          font-size: 3em;
          float: left;
          line-height: 0.9;
          margin: 0.05em 0.1em 0 0;
          font-weight: 600;
        }
        
        h1, h2, h3 {
          font-weight: 600;
          letter-spacing: -0.02em;
          margin: 2em 0 1em 0;
          text-indent: 0;
          color: ${theme.text};
        }
        
        h1 {
          font-size: 1.8em;
          text-align: center;
        }
        
        h2 {
          font-size: 1.4em;
        }
        
        h3 {
          font-size: 1.2em;
        }
        
        img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 20px auto;
          filter: grayscale(100%);
        }
        
        /* Custom scrollbar for reading area */
        div::-webkit-scrollbar {
          width: 6px;
        }
        
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        
        div::-webkit-scrollbar-thumb {
          background: ${theme.border};
          border-radius: 3px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: ${theme.textLight};
        }
        
        /* Smooth text rendering */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
      `}</style>
    </div>
  )
}

export default Reader