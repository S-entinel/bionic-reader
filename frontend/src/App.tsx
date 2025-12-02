import { useState } from 'react'
import FileUpload from './components/FileUpload'
import Reader from './components/Reader'
import { uploadEPUB, type EPUBUploadResponse } from './services/api'

function App() {
  const [epubData, setEpubData] = useState<EPUBUploadResponse | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const data = await uploadEPUB(file)
      setEpubData(data)
      console.log('EPUB uploaded:', data)
    } catch (err) {
      setError('Failed to upload EPUB')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleNewFile = () => {
    setEpubData(null)
    setError(null)
  }

  if (isUploading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Uploading EPUB...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error: {error}</h2>
        <button onClick={handleNewFile}>Try Again</button>
      </div>
    )
  }

  if (!epubData) {
    return <FileUpload onFileSelect={handleFileSelect} />
  }

  return (
    <Reader
      fileId={epubData.file_id}
      chapters={epubData.chapters}
      bookTitle={epubData.title}
      onNewFile={handleNewFile}
    />
  )
}

export default App