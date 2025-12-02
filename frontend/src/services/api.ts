import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

export interface Chapter {
  id: number
  title: string
  file_name: string
}

export interface EPUBUploadResponse {
  file_id: string
  filename: string
  title: string
  author: string
  total_chapters: number
  chapters: Chapter[]
}

export interface ChapterContent {
  chapter_id: number
  html_content: string
}

export const uploadEPUB = async (file: File): Promise<EPUBUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axios.post(`${API_BASE_URL}/api/upload-epub`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

export const getChapterContent = async (
  fileId: string,
  chapterId: number,
  boldPercentage: number = 0.5
): Promise<ChapterContent> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/chapter/${fileId}/${chapterId}`,
    { params: { bold_percentage: boldPercentage } }
  )

  return response.data
}