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
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  
  const contentRef = useRef<HTMLDivElement>(null)
  const [pageHeight, setPageHeight] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Dark mode colors
  const colors = {
    bg: darkMode ? '#1a1a1a' : '#ffffff',
    text: darkMode ? '#e0e0e0' : '#000000',
    border: darkMode ? '#444' : '#ccc',
    controlBg: darkMode ? '#2a2a2a' : '#f5f5f5',
    contentBg: darkMode ? '#1e1e1e' : 'white',
    contentBorder: darkMode ? '#333' : '#ddd',
  }

  // Calculate page height based on viewport
  useEffect(() => {
    const calculatePageHeight = () => {
      // Use viewport height minus controls/header (roughly 250px)
      const height = window.innerHeight - 250
      setPageHeight(height)
    }

    calculatePageHeight()
    window.addEventListener('resize', calculatePageHeight)
    return () => window.removeEventListener('resize', calculatePageHeight)
  }, [])

  // Calculate total pages when content or page height changes
  useEffect(() => {
    if (contentRef.current && pageHeight > 0) {
      const contentHeight = contentRef.current.scrollHeight
      const pages = Math.ceil(contentHeight / pageHeight)
      setTotalPages(pages)
    }
  }, [chapterContent, pageHeight])

  // Load chapter content
  useEffect(() => {
    const loadChapter = async () => {
      setIsLoading(true)
      setCurrentPage(0) // Reset to first page when changing chapters
      
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
    if (contentRef.current && pageHeight > 0) {
      const scrollPosition = currentPage * pageHeight
      contentRef.current.parentElement?.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      })
    }
  }, [currentPage, pageHeight])

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    } else if (currentChapter > 0) {
      // Go to previous chapter
      setCurrentChapter(currentChapter - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    } else if (currentChapter < chapters.length - 1) {
      // Go to next chapter
      setCurrentChapter(currentChapter + 1)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrevPage()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToNextPage()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  })

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', background: colors.bg, minHeight: '100vh', color: colors.text }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '10px' }}>
        <h1 style={{ margin: '0 0 10px 0' }}>{bookTitle}</h1>
        <button onClick={onNewFile}>Upload New Book</button>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '20px', padding: '15px', background: colors.controlBg, borderRadius: '4px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label>
            <input
              type="checkbox"
              checked={bionicEnabled}
              onChange={(e) => setBionicEnabled(e.target.checked)}
            />
            {' '}Bionic Reading
          </label>

          {bionicEnabled && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Bold: {Math.round(boldPercentage * 100)}%</span>
              <input
                type="range"
                min="0.3"
                max="0.7"
                step="0.05"
                value={boldPercentage}
                onChange={(e) => setBoldPercentage(parseFloat(e.target.value))}
                style={{ width: '150px' }}
              />
            </label>
          )}

          <label>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            {' '}Dark Mode
          </label>

          <label>
            Chapter: 
            <select
              value={currentChapter}
              onChange={(e) => setCurrentChapter(parseInt(e.target.value))}
              style={{ 
                marginLeft: '10px', 
                padding: '5px',
                background: colors.contentBg,
                color: colors.text,
                border: `1px solid ${colors.border}`
              }}
            >
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Page Navigation */}
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        gap: '15px', 
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px',
        background: colors.controlBg,
        borderRadius: '4px'
      }}>
        <button 
          onClick={goToPrevPage} 
          disabled={currentPage === 0 && currentChapter === 0}
          style={{ 
            padding: '8px 20px',
            cursor: currentPage === 0 && currentChapter === 0 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 0 && currentChapter === 0 ? 0.5 : 1,
            background: colors.contentBg,
            color: colors.text,
            border: `1px solid ${colors.border}`
          }}
        >
          ← Previous
        </button>
        
        <span style={{ minWidth: '150px', textAlign: 'center', color: colors.text }}>
          Page {currentPage + 1} of {totalPages}
        </span>
        
        <button 
          onClick={goToNextPage} 
          disabled={currentPage === totalPages - 1 && currentChapter === chapters.length - 1}
          style={{ 
            padding: '8px 20px',
            cursor: currentPage === totalPages - 1 && currentChapter === chapters.length - 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages - 1 && currentChapter === chapters.length - 1 ? 0.5 : 1,
            background: colors.contentBg,
            color: colors.text,
            border: `1px solid ${colors.border}`
          }}
        >
          Next →
        </button>
      </div>

      <div style={{ fontSize: '12px', color: darkMode ? '#888' : '#666', textAlign: 'center', marginBottom: '10px' }}>
        Use arrow keys to navigate • Chapter: {chapters[currentChapter]?.title}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: colors.text }}>Loading chapter...</div>
      ) : (
        <div
          style={{
            height: `${pageHeight}px`,
            overflow: 'hidden',
            border: `1px solid ${colors.contentBorder}`,
            background: colors.contentBg,
            position: 'relative'
          }}
        >
          <div
            ref={contentRef}
            style={{
              padding: '30px',
              lineHeight: '1.8',
              fontSize: '18px',
            }}
            dangerouslySetInnerHTML={{ 
              __html: bionicEnabled ? chapterContent : chapterContent.replace(/<\/?strong>/g, '') 
            }}
          />
          <style>{`
            /* Image styling for EPUB content */
            img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 20px auto;
              border-radius: 4px;
            }
            
            /* Ensure images work in both light and dark mode */
            ${darkMode ? 'img { opacity: 0.9; }' : ''}
          `}</style>
        </div>
      )}
    </div>
  )
}

export default Reader