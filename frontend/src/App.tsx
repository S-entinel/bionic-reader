import { useState } from 'react'
import FileUpload from './components/FileUpload'
import Reader from './components/Reader'
import { uploadEPUB, type BookData } from './services/api'

function App() {
  const [bookData, setBookData] = useState<BookData | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      // Upload and get the entire book as one HTML document!
      const data = await uploadEPUB(file)
      setBookData(data)
      console.log('EPUB loaded:', data.title, 'by', data.author)
    } catch (err) {
      setError('Failed to upload EPUB')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleNewFile = () => {
    setBookData(null)
    setError(null)
  }

  if (isUploading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #faf8f3 0%, #e8e5dd 100%)',
      }}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>📖</div>
          <h2 style={{ fontSize: '24px', color: '#2d2d2d', marginBottom: '12px' }}>
            Loading your book...
          </h2>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Processing EPUB
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #faf8f3 0%, #e8e5dd 100%)',
      }}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', color: '#2d2d2d', marginBottom: '12px' }}>
            Error: {error}
          </h2>
          <button 
            onClick={handleNewFile}
            style={{
              background: '#8b7355',
              color: 'white',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: '20px',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!bookData) {
    return <FileUpload onFileSelect={handleFileSelect} />
  }

  return (
    <Reader
      bookContent={bookData.html_content}
      bookTitle={bookData.title}
      onNewFile={handleNewFile}
    />
  )
}

export default App