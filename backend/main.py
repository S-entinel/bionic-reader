from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.epub_service import process_full_epub

app = FastAPI(title="Bionic EPUB Reader API", version="2.0.0")

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

@app.post("/api/upload-epub")
async def upload_epub(file: UploadFile = File(...)):
    """
    Upload an EPUB file and get the complete book as a single HTML document.
    """
    # Validate file type
    if not file.filename.lower().endswith('.epub'):
        raise HTTPException(status_code=400, detail="Only EPUB files are allowed")
    
    # Read file content
    content = await file.read()
    
    # Check file size (100MB limit)
    if len(content) > 100 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 100MB")
    
    try:
        # Process the entire EPUB and return as single HTML
        book_data = process_full_epub(content)
        
        return {
            "filename": file.filename,
            "title": book_data["title"],
            "author": book_data["author"],
            "html_content": book_data["html_content"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EPUB processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)