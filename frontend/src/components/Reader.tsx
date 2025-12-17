import { useState, useEffect, useRef } from 'react'
import { getChapterContent, type Chapter } from '../services/api'

interface ReaderProps {
  fileId: string
  chapters: Chapter[]
  bookTitle: string
  onNewFile: () => void
}

const Reader = ({ fileId, chapters, bookTitle, onNewFile }: ReaderProps) => {
  const [currentChapter, setCurrentChapter] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [chapterContent, setChapterContent] = useState('')
  const [bionicEnabled, setBionicEnabled] = useState(true)
  const [boldPercentage, setBoldPercentage] = useState(0.5)
  const [fontSize, setFontSize] = useState(18)
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  
  // UI state
  const [showControls, setShowControls] = useState(true)
  const [showTOC, setShowTOC] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pageHeight, setPageHeight] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null)

  // Theme colors - book on desk aesthetic
  const theme = {
    desk: '#000000', // Black desk
    pageBg: darkMode ? '#2c2416' : '#f4f1e8', // Paper color
    text: darkMode ? '#e8dcc8' : '#2c2416',
    textSecondary: darkMode ? '#b8a890' : '#5c5246',
    border: darkMode ? '#4a3f2f' : '#d4cbb8',
    controlBg: darkMode ? 'rgba(44, 36, 22, 0.95)' : 'rgba(244, 241, 232, 0.95)',
    overlayBg: darkMode ? 'rgba(28, 22, 14, 0.98)' : 'rgba(250, 248, 243, 0.98)',
    buttonBg: darkMode ? '#3a3020' : '#e8dcc8',
    buttonHover: darkMode ? '#4a3f2f' : '#d4cbb8',
    progressBg: darkMode ? '#3a3020' : '#d4cbb8',
    progressFill: darkMode ? '#8b7355' : '#8b7355',
    shadow: 'rgba(0, 0, 0, 0.4)',
  }

  // Calculate page height - book page size
  useEffect(() => {
    const calculatePageHeight = () => {
      // Book takes up most of screen but leaves black border
      const height = window.innerHeight * 0.85
      setPageHeight(height)
    }
    calculatePageHeight()
    window.addEventListener('resize', calculatePageHeight)
    return () => window.removeEventListener('resize', calculatePageHeight)
  }, [])

  // Calculate total pages
  useEffect(() => {
    if (contentRef.current && pageHeight > 0) {
      const contentHeight = contentRef.current.scrollHeight
      const pages = Math.ceil(contentHeight / pageHeight)
      setTotalPages(pages)
    }
  }, [chapterContent, pageHeight, fontSize])

  // Load chapter content
  useEffect(() => {
    const loadChapter = async () => {
      setIsLoading(true)
      setCurrentPage(0)
      
      try {
        const data = await getChapterContent(fileId, currentChapter, boldPercentage)
        setChapterContent(data.html_content)
      } catch (error) {
        console.error('Failed to load chapter:', error)
        alert('Failed to load chapter')
      } finally {
        setIsLoading(false)
      }
    }
    loadChapter()
  }, [fileId, currentChapter, boldPercentage])

  // Scroll to current page
  useEffect(() => {
    if (containerRef.current && pageHeight > 0) {
      const scrollPosition = currentPage * pageHeight
      containerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      })
    }
  }, [currentPage, pageHeight])

  // Auto-hide controls
  useEffect(() => {
    if (showControls && !showTOC && !showSettings) {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current)
      }
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current)
      }
    }
  }, [showControls, showTOC, showSettings])

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    } else if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    } else if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1)
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

  const goToChapter = (chapterId: number) => {
    setCurrentChapter(chapterId)
    setShowTOC(false)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showTOC || showSettings) return
      
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

  // Calculate reading progress
  const totalPagesInBook = chapters.reduce((sum, _, idx) => {
    if (idx < currentChapter) return sum + 1
    if (idx === currentChapter) return sum + (currentPage / totalPages)
    return sum
  }, 0)
  const progressPercentage = (totalPagesInBook / chapters.length) * 100

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
      
      {/* The Book - centered on black desk */}
      <div style={{
        width: '850px',
        height: `${pageHeight}px`,
        background: theme.pageBg,
        boxShadow: `0 20px 60px ${theme.shadow}, 0 0 0 1px ${theme.border}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
      }}>
        
        {/* Top Header Bar - part of the book */}
        <div style={{
          height: showControls ? '50px' : '0',
          background: theme.controlBg,
          borderBottom: showControls ? `1px solid ${theme.border}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 30px',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          opacity: showControls ? 1 : 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => setShowTOC(!showTOC)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: theme.text,
                padding: '4px 8px',
              }}
              title="Table of Contents"
            >
              ☰
            </button>
            <h1 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: 500,
              maxWidth: '400px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: theme.text,
            }}>
              {bookTitle}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: theme.text,
                padding: '4px 8px',
              }}
              title="Settings"
            >
              ⚙
            </button>
            <button
              onClick={onNewFile}
              style={{
                background: theme.buttonBg,
                border: 'none',
                padding: '6px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: theme.text,
                fontSize: '13px',
              }}
            >
              New Book
            </button>
          </div>
        </div>

        {/* Main Reading Content - the book page */}
        {isLoading ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: theme.textSecondary,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>📖</div>
              Loading chapter...
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            onClick={handleContentClick}
            style={{
              flex: 1,
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div
              ref={contentRef}
              style={{
                padding: '50px 80px',
                lineHeight: '1.8',
                fontSize: `${fontSize}px`,
                color: theme.text,
              }}
              dangerouslySetInnerHTML={{ 
                __html: bionicEnabled ? chapterContent : chapterContent.replace(/<\/?strong>/g, '') 
              }}
            />
          </div>
        )}

        {/* Bottom Progress Bar - part of the book */}
        <div style={{
          height: '35px',
          background: theme.controlBg,
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 30px',
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              flex: 1,
              height: '3px',
              background: theme.progressBg,
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: '100%',
                background: theme.progressFill,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: theme.textSecondary,
              whiteSpace: 'nowrap',
              minWidth: '100px',
              textAlign: 'right',
            }}>
              {currentPage + 1} / {totalPages}
            </div>
          </div>
        </div>

        {/* Chapter info overlay */}
        {showControls && (
          <div style={{
            position: 'absolute',
            bottom: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: theme.controlBg,
            padding: '10px 20px',
            borderRadius: '16px',
            fontSize: '13px',
            color: theme.textSecondary,
            border: `1px solid ${theme.border}`,
            backdropFilter: 'blur(10px)',
            pointerEvents: 'none',
          }}>
            {chapters[currentChapter]?.title}
          </div>
        )}
      </div>

      {/* Table of Contents Overlay - floats over everything */}
      {showTOC && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1000,
            }}
            onClick={() => setShowTOC(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            maxHeight: '80vh',
            background: theme.overlayBg,
            backdropFilter: 'blur(10px)',
            zIndex: 1001,
            overflowY: 'auto',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: `0 20px 60px ${theme.shadow}`,
            border: `1px solid ${theme.border}`,
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              marginBottom: '24px',
              fontWeight: 500,
              color: theme.text,
            }}>
              Table of Contents
            </h2>
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                onClick={() => goToChapter(chapter.id)}
                style={{
                  padding: '12px 16px',
                  marginBottom: '6px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: currentChapter === chapter.id ? theme.buttonBg : 'transparent',
                  transition: 'background 0.2s',
                  fontWeight: currentChapter === chapter.id ? 500 : 400,
                  color: theme.text,
                }}
                onMouseEnter={(e) => {
                  if (currentChapter !== chapter.id) {
                    e.currentTarget.style.background = theme.buttonBg
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentChapter !== chapter.id) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {chapter.title}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Settings Overlay */}
      {showSettings && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1000,
            }}
            onClick={() => setShowSettings(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            maxHeight: '80vh',
            background: theme.overlayBg,
            backdropFilter: 'blur(10px)',
            zIndex: 1001,
            overflowY: 'auto',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: `0 20px 60px ${theme.shadow}`,
            border: `1px solid ${theme.border}`,
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              marginBottom: '30px',
              fontWeight: 500,
              color: theme.text,
            }}>
              Reading Settings
            </h2>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                cursor: 'pointer',
                fontSize: '15px',
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
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '10px' }}>
                  Bold Amount: {Math.round(boldPercentage * 100)}%
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

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '10px' }}>
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

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                cursor: 'pointer',
                fontSize: '15px',
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

            <div style={{ 
              padding: '14px',
              background: theme.buttonBg,
              borderRadius: '6px',
              fontSize: '12px',
              color: theme.textSecondary,
              lineHeight: '1.6',
            }}>
              <strong style={{ color: theme.text }}>Reading Tips:</strong><br/>
              • Click left/right edges to turn pages<br/>
              • Click center to show/hide controls<br/>
              • Arrow keys or spacebar to navigate<br/>
              • ESC to toggle controls
            </div>
          </div>
        </>
      )}

      {/* Global styles for book content */}
      <style>{`
        /* Book page styling */
        p {
          text-indent: 30px;
          margin: 15px 0;
          text-align: justify;
        }
        
        p:first-of-type {
          text-indent: 0;
        }
        
        p:first-of-type::first-letter {
          font-size: 3.5em;
          float: left;
          line-height: 0.9;
          margin: 0.05em 0.1em 0 0;
          font-weight: bold;
        }
        
        h1, h2, h3 {
          text-align: center;
          font-weight: normal;
          letter-spacing: 1px;
          margin: 20px 0;
        }
        
        img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 30px auto;
          border-radius: 4px;
        }
        
        /* Hide scrollbar but keep functionality */
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default Reader