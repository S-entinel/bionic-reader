import { useState } from 'react'
import FileUpload from './components/FileUpload'
import { convertPDF } from './services/api'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setConvertedPdfUrl(null)
    setError(null)
    console.log('File selected:', file.name)
  }

  const handleConvert = async () => {
    if (!selectedFile) return

    setIsConverting(true)
    setError(null)
    setConvertedPdfUrl(null)

    try {
      const blob = await convertPDF(selectedFile)
      
      const url = URL.createObjectURL(blob)
      setConvertedPdfUrl(url)
      
      console.log('Conversion successful!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during conversion')
      console.error('Conversion error:', err)
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (!convertedPdfUrl || !selectedFile) return

    const link = document.createElement('a')
    link.href = convertedPdfUrl
    link.download = `bionic_${selectedFile.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bionic Reading Converter</h1>
        <p>Transform PDFs into bionic reading format</p>
      </header>

      <main className="app-main">
        <div className="upload-section">
          <FileUpload onFileSelect={handleFileSelect} />
          
          {selectedFile && !convertedPdfUrl && (
            <div className="selected-file-info">
              <p>Ready to convert: <strong>{selectedFile.name}</strong></p>
              <button 
                className="convert-btn" 
                onClick={handleConvert}
                disabled={isConverting}
              >
                {isConverting ? 'Converting...' : 'Convert'}
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
            </div>
          )}

          {convertedPdfUrl && (
            <div className="success-section">
              <p className="success-message">Conversion complete</p>
              <div className="action-buttons">
                <button className="download-btn" onClick={handleDownload}>
                  Download
                </button>
                <button 
                  className="convert-another-btn" 
                  onClick={() => {
                    setSelectedFile(null)
                    setConvertedPdfUrl(null)
                  }}
                >
                  New Conversion
                </button>
              </div>
              
              <div className="pdf-preview">
                <h3>Preview</h3>
                <iframe 
                  src={convertedPdfUrl} 
                  title="Converted PDF Preview"
                  width="100%" 
                  height="600px"
                  style={{ border: '1px solid #e5e5e5' }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App