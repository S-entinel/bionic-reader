// localStorage management for book reading positions
import type { BookPosition } from './types'

const STORAGE_KEY = 'bionicReader_bookPositions'
const CONTENT_LENGTH_TOLERANCE = 0.05 // 5% tolerance for content length matching

/**
 * Save reading position for a book
 */
export const saveBookPosition = (
  title: string,
  author: string,
  scrollPosition: number,
  contentLength: number
): void => {
  try {
    const positions = getAllBookPositions()
    const bookKey = getBookKey(title, author)
    
    positions[bookKey] = {
      title,
      author,
      scrollPosition,
      contentLength,
      lastRead: Date.now()
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
  } catch (error) {
    console.error('Failed to save book position:', error)
  }
}

/**
 * Load reading position for a book (hybrid approach)
 * Matches on title+author AND verifies content length is similar
 */
export const loadBookPosition = (
  title: string,
  author: string,
  contentLength: number
): number | null => {
  try {
    const positions = getAllBookPositions()
    const bookKey = getBookKey(title, author)
    const saved = positions[bookKey]
    
    if (!saved) return null
    
    // Verify content length is similar (within tolerance)
    const lengthDiff = Math.abs(saved.contentLength - contentLength)
    const tolerance = saved.contentLength * CONTENT_LENGTH_TOLERANCE
    
    if (lengthDiff > tolerance) {
      console.warn('Book content length differs significantly - different edition?')
      return null
    }
    
    return saved.scrollPosition
  } catch (error) {
    console.error('Failed to load book position:', error)
    return null
  }
}

/**
 * Get all saved book positions
 */
export const getAllBookPositions = (): Record<string, BookPosition> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Failed to load book positions:', error)
    return {}
  }
}

/**
 * Clear position for a specific book
 */
export const clearBookPosition = (title: string, author: string): void => {
  try {
    const positions = getAllBookPositions()
    const bookKey = getBookKey(title, author)
    delete positions[bookKey]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
  } catch (error) {
    console.error('Failed to clear book position:', error)
  }
}

/**
 * Clear all saved positions
 */
export const clearAllPositions = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear all positions:', error)
  }
}

/**
 * Get recently read books (sorted by lastRead timestamp)
 */
export const getRecentlyReadBooks = (limit: number = 10): BookPosition[] => {
  try {
    const positions = getAllBookPositions()
    return Object.values(positions)
      .sort((a, b) => b.lastRead - a.lastRead)
      .slice(0, limit)
  } catch (error) {
    console.error('Failed to get recently read books:', error)
    return []
  }
}

/**
 * Generate a unique key for a book based on title and author
 */
const getBookKey = (title: string, author: string): string => {
  return `${title.toLowerCase().trim()}_${author.toLowerCase().trim()}`
    .replace(/[^a-z0-9_]/g, '_')
}