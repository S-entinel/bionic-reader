interface FileUploadProps {
    onFileSelect: (file: File) => void
  }
  
  const FileUpload = ({ onFileSelect }: FileUploadProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.name.toLowerCase().endsWith('.epub')) {
        onFileSelect(file)
      } else {
        alert('Please select an EPUB file')
      }
    }
  
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Upload EPUB File</h2>
        <input
          type="file"
          accept=".epub"
          onChange={handleChange}
          style={{ margin: '20px' }}
        />
      </div>
    )
  }
  
  export default FileUpload