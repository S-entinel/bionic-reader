import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

export interface ConversionResponse {
  filename: string
  message: string
}

export const convertPDF = async (file: File): Promise<Blob> => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await axios.post(`${API_BASE_URL}/api/convert`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob', // Important: we're receiving a PDF file back
    })

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Conversion failed')
    }
    throw error
  }
}