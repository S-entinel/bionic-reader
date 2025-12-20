import { useRef } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
}

const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.toLowerCase().endsWith('.epub')) {
      onFileSelect(file)
    } else {
      alert('Please select an EPUB file')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.toLowerCase().endsWith('.epub')) {
      onFileSelect(file)
    } else {
      alert('Please select an EPUB file')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #faf8f3 0%, #e8e5dd 100%)',
      fontFamily: "'Bookerly', 'Georgia', serif",
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '24px',
          animation: 'float 3s ease-in-out infinite',
        }}>
          📚
        </div>

        <h1 style={{
          fontSize: '42px',
          fontWeight: 500,
          margin: '0 0 12px 0',
          color: '#2d2d2d',
          letterSpacing: '-0.5px',
        }}>
          Bionic Reader
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#666',
          margin: '0 0 48px 0',
          lineHeight: '1.6',
        }}>
          Experience enhanced reading with bionic formatting.<br/>
          Upload your EPUB to get started.
        </p>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            border: '2px dashed #c4b5a0',
            borderRadius: '16px',
            padding: '60px 40px',
            cursor: 'pointer',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#8b7355'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#c4b5a0'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".epub"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📖</div>
          
          <div style={{
            fontSize: '20px',
            fontWeight: 500,
            color: '#2d2d2d',
            marginBottom: '12px',
          }}>
            Choose an EPUB file
          </div>
          
          <div style={{
            fontSize: '15px',
            color: '#888',
            marginBottom: '24px',
          }}>
            or drag and drop here
          </div>

          <button style={{
            background: '#8b7355',
            color: 'white',
            border: 'none',
            padding: '14px 32px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s',
            boxShadow: '0 2px 8px rgba(139, 115, 85, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#6f5b44'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#8b7355'
          }}>
            Browse Files
          </button>
        </div>

        <div style={{
          marginTop: '48px',
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          flexWrap: 'wrap',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '160px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Bionic reading for faster comprehension
            </div>
          </div>
          <div style={{ textAlign: 'center', maxWidth: '160px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌙</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Comfortable dark mode reading
            </div>
          </div>
          <div style={{ textAlign: 'center', maxWidth: '160px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚙️</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Customizable reading experience
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '48px',
          fontSize: '13px',
          color: '#999',
        }}>
          Your files are processed locally and never stored on our servers
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}

export default FileUpload