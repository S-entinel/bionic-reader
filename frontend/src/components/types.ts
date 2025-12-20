// Shared TypeScript types for the Reader component

export interface ReaderProps {
    bookContent: string
    bookTitle: string
    bookAuthor: string
    onNewFile: () => void
  }
  
  export interface Theme {
    bg: string
    paper: string
    text: string
    textLight: string
    border: string
    accent: string
    shadow: string
  }
  
  export interface ReadingPreferences {
    bionicEnabled: boolean
    boldPercentage: number
    fontSize: number
    lineHeight: number
  }
  
  export interface BookPosition {
    title: string
    author: string
    scrollPosition: number
    contentLength: number
    lastRead: number // timestamp
  }