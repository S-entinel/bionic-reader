import type { Theme, ReadingPreferences } from './types'

interface ReaderSidebarProps {
  bookTitle: string
  progress: number
  showSettings: boolean
  setShowSettings: (value: boolean) => void
  preferences: ReadingPreferences
  setPreferences: {
    setBionicEnabled: (value: boolean) => void
    setBoldPercentage: (value: number) => void
    setFontSize: (value: number) => void
    setLineHeight: (value: number) => void
  }
  theme: Theme
  onNewFile: () => void
}

const ReaderSidebar = ({
  bookTitle,
  progress,
  showSettings,
  setShowSettings,
  preferences,
  setPreferences,
  theme,
  onNewFile,
}: ReaderSidebarProps) => {
  const { bionicEnabled, boldPercentage, fontSize, lineHeight } = preferences
  const { setBionicEnabled, setBoldPercentage, setFontSize, setLineHeight } = setPreferences

  return (
    <div style={{
      width: '280px',
      height: '100vh',
      background: theme.paper,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 24px',
      overflowY: 'auto',
    }}>
      {/* Book Title */}
      <div style={{
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 600,
          margin: 0,
          color: theme.text,
          lineHeight: 1.4,
        }}>
          {bookTitle}
        </h1>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '12px',
          color: theme.textLight,
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Progress
        </div>
        <div style={{
          fontSize: '24px',
          fontWeight: 600,
          color: theme.text,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {Math.round(progress)}%
        </div>
        <div style={{
          marginTop: '12px',
          height: '2px',
          background: theme.border,
          borderRadius: '1px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: theme.accent,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div style={{
        marginBottom: '32px',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.02)',
        borderRadius: '4px',
        fontSize: '12px',
        color: theme.textLight,
      }}>
        <div style={{ 
          fontWeight: 600, 
          marginBottom: '8px',
          color: theme.text,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Shortcuts
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <div><kbd style={{ 
            background: theme.bg, 
            padding: '2px 6px', 
            borderRadius: '3px',
            border: `1px solid ${theme.border}`,
            fontSize: '11px',
          }}>Space</kbd> Page down</div>
          <div><kbd style={{ 
            background: theme.bg, 
            padding: '2px 6px', 
            borderRadius: '3px',
            border: `1px solid ${theme.border}`,
            fontSize: '11px',
          }}>S</kbd> Settings</div>
          <div><kbd style={{ 
            background: theme.bg, 
            padding: '2px 6px', 
            borderRadius: '3px',
            border: `1px solid ${theme.border}`,
            fontSize: '11px',
          }}>B</kbd> Toggle bionic</div>
          <div><kbd style={{ 
            background: theme.bg, 
            padding: '2px 6px', 
            borderRadius: '3px',
            border: `1px solid ${theme.border}`,
            fontSize: '11px',
          }}>+/-</kbd> Font size</div>
        </div>
      </div>

      {/* Settings Toggle */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        style={{
          background: showSettings ? theme.accent : 'transparent',
          color: showSettings ? theme.bg : theme.text,
          border: `1px solid ${showSettings ? theme.accent : theme.border}`,
          borderRadius: '4px',
          padding: '12px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: '16px',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
        }}
      >
        {showSettings ? '✕ Close Settings' : '⚙ Settings'}
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          paddingTop: '16px',
          borderTop: `1px solid ${theme.border}`,
        }}>
          {/* Bionic Reading Toggle */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              color: theme.text,
            }}>
              <input
                type="checkbox"
                checked={bionicEnabled}
                onChange={(e) => setBionicEnabled(e.target.checked)}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  cursor: 'pointer',
                  accentColor: theme.accent,
                }}
              />
              Bionic Reading
            </label>
          </div>

          {/* Bold Percentage */}
          {bionicEnabled && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                fontSize: '12px', 
                color: theme.textLight, 
                display: 'block', 
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Bold Intensity: {Math.round(boldPercentage * 100)}%
              </label>
              <input
                type="range"
                min="0.3"
                max="0.7"
                step="0.05"
                value={boldPercentage}
                onChange={(e) => setBoldPercentage(parseFloat(e.target.value))}
                style={{ 
                  width: '100%', 
                  cursor: 'pointer',
                  accentColor: theme.accent,
                }}
              />
            </div>
          )}

          {/* Font Size */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              fontSize: '12px', 
              color: theme.textLight, 
              display: 'block', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="14"
              max="24"
              step="2"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              style={{ 
                width: '100%', 
                cursor: 'pointer',
                accentColor: theme.accent,
              }}
            />
          </div>

          {/* Line Spacing */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              fontSize: '12px', 
              color: theme.textLight, 
              display: 'block', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Line Spacing: {lineHeight.toFixed(1)}
            </label>
            <input
              type="range"
              min="1.4"
              max="2.2"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              style={{ 
                width: '100%', 
                cursor: 'pointer',
                accentColor: theme.accent,
              }}
            />
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* New Book Button */}
      <button
        onClick={onNewFile}
        style={{
          background: 'transparent',
          color: theme.textLight,
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          padding: '12px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.accent
          e.currentTarget.style.color = theme.accent
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.border
          e.currentTarget.style.color = theme.textLight
        }}
      >
        ← New Book
      </button>
    </div>
  )
}

export default ReaderSidebar