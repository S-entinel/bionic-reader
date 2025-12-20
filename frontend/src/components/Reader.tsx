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
  const [darkMode, setDarkMode] = useState(false)
  
  // UI state
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  
  // Refs
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null)

  // Theme configuration
  const theme = {
    desk: '#1a1a1a',
    pageBg: darkMode ? '#1e1e1e' : '#faf9f6',
    text: darkMode ? '#d4d4d4' : '#2a2a2a',
    textSecondary: darkMode ? '#8a8a8a' : '#666666',
    border: darkMode ? '#2a2a2a' : '#e0e0e0',
    controlBg: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(250, 249, 246, 0.95)',
    overlayBg: darkMode ? 'rgba(25, 25, 25, 0.98)' : 'rgba(250, 249, 246, 0.98)',
    buttonBg: darkMode ? '#2a2a2a' : '#f0f0f0',
    buttonHover: darkMode ? '#3a3a3a' : '#e5e5e5',
    shadow: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.15)',
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
  
  const pageHeight = scrollContainerRef.current 
    ? scrollContainerRef.current.clientHeight 
    : window.innerHeight * 0.85 - 40

  const totalHeight = contentRef.current ? contentRef.current.scrollHeight : 0
  const maxScroll = scrollContainerRef.current && contentRef.current
    ? contentRef.current.scrollHeight - scrollContainerRef.current.clientHeight 
    : 0

  // Simple progress percentage based on scroll position
  const progress = maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0

  // Current page and total pages
  const currentPage = totalHeight > 0 && pageHeight > 0 ? Math.floor(scrollPosition / pageHeight) + 1 : 1
  const totalPages = totalHeight > 0 && pageHeight > 0 ? Math.ceil(totalHeight / pageHeight) : 1

  // ==================== NAVIGATION ====================
  
  const goToPrevPage = () => {
    if (scrollContainerRef.current) {
      const newScroll = Math.max(0, scrollPosition - pageHeight)
      scrollContainerRef.current.scrollTo({
        top: newScroll,
        behavior: 'smooth'
      })
    }
  }

  const goToNextPage = () => {
    if (scrollContainerRef.current && contentRef.current) {
      const maxScroll = contentRef.current.scrollHeight - scrollContainerRef.current.clientHeight
      const newScroll = Math.min(maxScroll, scrollPosition + pageHeight)
      
      scrollContainerRef.current.scrollTo({
        top: newScroll,
        behavior: 'smooth'
      })
    }
  }

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    
    if (clickX < width * 0.3) {
      goToPrevPage()
    } else if (clickX > width * 0.7) {
      goToNextPage()
    } else {
      setShowControls(!showControls)
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollTop)
    }
  }

  // ==================== EFFECTS ====================

  // Auto-hide controls
  useEffect(() => {
    if (showControls && !showSettings) {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    }
  }, [showControls, showSettings])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showSettings) return
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrevPage()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        goToNextPage()
      } else if (e.key === 'Escape') {
        setShowControls(!showControls)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  })

  // Debug: Log when bookContent changes
  useEffect(() => {
    console.log('Book content loaded:', bookContent ? `${bookContent.length} characters` : 'empty')
  }, [bookContent])

  // ==================== RENDER ====================

  if (!bookContent) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#faf9f6',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '18px', color: '#666' }}>No book content loaded</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: theme.desk,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      
      {/* Floating Controls */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 500,
        display: 'flex',
        gap: '10px',
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.3s',
        pointerEvents: showControls ? 'auto' : 'none',
      }}>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: theme.controlBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            padding: '10px 14px',
            cursor: 'pointer',
            color: theme.text,
            fontSize: '16px',
            backdropFilter: 'blur(10px)',
            boxShadow: `0 2px 8px ${theme.shadow}`,
          }}
        >
          ⚙️
        </button>
        <button
          onClick={onNewFile}
          style={{
            background: theme.buttonBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            padding: '10px 18px',
            cursor: 'pointer',
            color: theme.text,
            fontSize: '13px',
            backdropFilter: 'blur(10px)',
            boxShadow: `0 2px 8px ${theme.shadow}`,
          }}
        >
          New Book
        </button>
      </div>

      {/* Book Title */}
      {showControls && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 500,
          background: theme.controlBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '6px',
          padding: '10px 24px',
          backdropFilter: 'blur(10px)',
          boxShadow: `0 2px 8px ${theme.shadow}`,
          color: theme.text,
          fontSize: '14px',
          fontWeight: 500,
          maxWidth: '500px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {bookTitle}
        </div>
      )}

      {/* The Book */}
      <div style={{
        width: '850px',
        height: `${window.innerHeight * 0.85}px`,
        background: theme.pageBg,
        boxShadow: `0 10px 40px ${theme.shadow}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
        border: `1px solid ${theme.border}`,
      }}>
        
        {/* Page Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onClick={handleContentClick}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            cursor: 'pointer',
            scrollBehavior: 'smooth',
          }}
        >
          <div
            ref={contentRef}
            style={{
              padding: '60px 80px',
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}`,
              color: theme.text,
              minHeight: '100%',
            }}
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '40px',
          background: theme.controlBg,
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          gap: '20px',
        }}>
          <div style={{
            flex: 1,
            height: '2px',
            background: theme.border,
            borderRadius: '1px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: theme.text,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: theme.textSecondary,
            whiteSpace: 'nowrap',
            minWidth: '80px',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {currentPage} / {totalPages}
          </div>
        </div>
      </div>

      {/* Page Turn Indicators */}
      {!showControls && scrollPosition > 0 && (
        <div style={{
          position: 'fixed',
          left: 'calc(50% - 425px - 40px)',
          top: '50%',
          transform: 'translateY(-50%)',
          color: theme.textSecondary,
          fontSize: '32px',
          opacity: 0.3,
          pointerEvents: 'none',
        }}>
          ‹
        </div>
      )}
      {!showControls && scrollContainerRef.current && contentRef.current && 
       scrollPosition < contentRef.current.scrollHeight - scrollContainerRef.current.clientHeight - 10 && (
        <div style={{
          position: 'fixed',
          right: 'calc(50% - 425px - 40px)',
          top: '50%',
          transform: 'translateY(-50%)',
          color: theme.textSecondary,
          fontSize: '32px',
          opacity: 0.3,
          pointerEvents: 'none',
        }}>
          ›
        </div>
      )}

      {/* Settings */}
      {showSettings && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
            }}
            onClick={() => setShowSettings(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '380px',
            maxHeight: '70vh',
            background: theme.overlayBg,
            backdropFilter: 'blur(10px)',
            zIndex: 1001,
            overflowY: 'auto',
            padding: '30px',
            borderRadius: '6px',
            boxShadow: `0 10px 40px ${theme.shadow}`,
            border: `1px solid ${theme.border}`,
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              marginBottom: '24px',
              fontWeight: 500,
              color: theme.text,
            }}>
              Settings
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                color: theme.text,
              }}>
                <input
                  type="checkbox"
                  checked={bionicEnabled}
                  onChange={(e) => setBionicEnabled(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Bionic Reading
              </label>
            </div>

            {bionicEnabled && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '8px' }}>
                  Bold: {Math.round(boldPercentage * 100)}%
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="0.7"
                  step="0.05"
                  value={boldPercentage}
                  onChange={(e) => setBoldPercentage(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '8px' }}>
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="14"
                max="24"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '8px' }}>
                Line Spacing: {lineHeight.toFixed(1)}
              </label>
              <input
                type="range"
                min="1.4"
                max="2.2"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                color: theme.text,
              }}>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Dark Mode
              </label>
            </div>
          </div>
        </>
      )}

      {/* Global Styles */}
      <style>{`
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
          font-weight: bold;
        }
        
        h1, h2, h3 {
          text-align: center;
          font-weight: 500;
          letter-spacing: 0.3px;
          margin: 1.5em 0 1em 0;
          text-indent: 0;
        }
        
        img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 20px auto;
        }
        
        *::-webkit-scrollbar {
          width: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background: ${theme.textSecondary};
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: ${theme.text};
        }
      `}</style>
    </div>
  )
}

export default Reader