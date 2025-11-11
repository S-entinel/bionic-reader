from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
from services.pdf_generator import generate_bionic_pdf

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/convert")
async def convert_pdf(
    file: UploadFile = File(...),
    bold_percentage: float = 0.5
):
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Read file content
    content = await file.read()
    
    # Check file size (10MB limit)
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB")
    
    try:
        # Process the PDF
        converted_pdf = generate_bionic_pdf(content, bold_percentage)
        
        # Return as downloadable file
        return StreamingResponse(
            io.BytesIO(converted_pdf),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=bionic_{file.filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)