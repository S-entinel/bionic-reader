import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

export interface BookData {
  filename: string
  title: string
  author: string
  html_content: string  // The entire book as one HTML document!
}

export const uploadEPUB = async (file: File): Promise<BookData> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axios.post(`${API_BASE_URL}/api/upload-epub`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}