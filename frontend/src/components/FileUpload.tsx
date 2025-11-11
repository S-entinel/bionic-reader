import { useCallback, useState } from 'react'
import './FileUpload.css'

interface FileUploadProps {
  onFileSelect: (file: File) => void
}

const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf') {
        setSelectedFileName(file.name)
        onFileSelect(file)
      } else {
        alert('Please upload a PDF file')
      }
    }
  }, [onFileSelect])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf') {
        setSelectedFileName(file.name)
        onFileSelect(file)
      } else {
        alert('Please upload a PDF file')
      }
    }
  }

  return (
    <div className="file-upload">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${selectedFileName ? 'file-selected' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          accept=".pdf"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        {selectedFileName ? (
          <div className="file-info">
            <div className="file-icon"></div>
            <div className="file-name">{selectedFileName}</div>
            <label htmlFor="file-input" className="change-file-btn">
              Change File
            </label>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon"></div>
            <h3>Drag and drop your PDF here</h3>
            <p>or</p>
            <label htmlFor="file-input" className="browse-btn">
              Browse Files
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload