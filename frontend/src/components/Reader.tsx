import { useState, useEffect, useRef } from 'react'
import type { ReaderProps, Theme } from './types'
import ReaderSidebar from './ReaderSidebar'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { getFormattedContent } from './BionicFormatter'
import { saveBookPosition, loadBookPosition } from './BookStorage'

const Reader = ({ bookContent, bookTitle, bookAuthor, onNewFile }: ReaderProps) => {
  // Reading state
  const [scrollPosition, setScrollPosition] = useState(0)
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false)
  
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

  // Theme
  const theme: Theme = {
    bg: '#ffffff',
    paper: '#fafafa',
    text: '#1a1a1a',
    textLight: '#666666',
    border: '#e0e0e0',
    accent: '#2a2a2a',
    shadow: 'rgba(0, 0, 0, 0.08)',
  }

  // ==================== KEYBOARD SHORTCUTS ====================
  
  useKeyboardShortcuts({
    scrollContainerRef,
    showSettings,
    setShowSettings,
    setBionicEnabled,
    setFontSize,
  })

  // ==================== READING POSITION MANAGEMENT ====================
  
  // Restore reading position when book loads
  useEffect(() => {
    if (bookContent && !hasRestoredPosition && scrollContainerRef.current) {
      const contentLength = bookContent.length
      const savedPosition = loadBookPosition(bookTitle, bookAuthor, contentLength)
      
      if (savedPosition !== null) {
        // Wait a tick for content to render, then restore position
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: savedPosition, behavior: 'auto' })
            const scrollHeight = scrollContainerRef.current.scrollHeight || 1
            console.log(`📖 Restored position for "${bookTitle}" at ${Math.round((savedPosition / scrollHeight) * 100)}%`)
          }
        }, 100)
      }
      
      setHasRestoredPosition(true)
    }
  }, [bookContent, bookTitle, bookAuthor, hasRestoredPosition])

  // Save reading position periodically
  useEffect(() => {
    if (!bookContent || !hasRestoredPosition) return

    const saveInterval = setInterval(() => {
      const contentLength = bookContent.length
      saveBookPosition(bookTitle, bookAuthor, scrollPosition, contentLength)
    }, 5000) // Save every 5 seconds

    return () => clearInterval(saveInterval)
  }, [bookContent, bookTitle, bookAuthor, scrollPosition, hasRestoredPosition])

  // Save position when unmounting
  useEffect(() => {
    return () => {
      if (bookContent && hasRestoredPosition) {
        const contentLength = bookContent.length
        saveBookPosition(bookTitle, bookAuthor, scrollPosition, contentLength)
      }
    }
  }, [bookContent, bookTitle, bookAuthor, scrollPosition, hasRestoredPosition])

  // ==================== BIONIC FORMATTING ====================
  
  const displayContent = getFormattedContent(bookContent, bionicEnabled, boldPercentage)

  // ==================== PROGRESS CALCULATION ====================
  
  const maxScroll = scrollContainerRef.current && contentRef.current
    ? contentRef.current.scrollHeight - scrollContainerRef.current.clientHeight 
    : 0

  const progress = maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0

  // ==================== EVENT HANDLERS ====================

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
      
      {/* Left Sidebar */}
      <ReaderSidebar
        bookTitle={bookTitle}
        progress={progress}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        preferences={{ bionicEnabled, boldPercentage, fontSize, lineHeight }}
        setPreferences={{ setBionicEnabled, setBoldPercentage, setFontSize, setLineHeight }}
        theme={theme}
        onNewFile={onNewFile}
      />

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