from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from services.file_manager import file_manager
from services.epub_service import extract_epub_data, get_chapter_content

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

@app.post("/api/upload-epub")
async def upload_epub(file: UploadFile = File(...)):
    """
    Upload an EPUB file and get book metadata with chapter list.
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
        # Store file and get session ID
        file_id = file_manager.store_file(content, file.filename)
        
        # Extract EPUB metadata and chapters
        epub_data = extract_epub_data(content)
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "title": epub_data["title"],
            "author": epub_data["author"],
            "total_chapters": epub_data["total_chapters"],
            "chapters": epub_data["chapters"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EPUB processing failed: {str(e)}")

@app.get("/api/chapter/{file_id}/{chapter_id}")
async def get_chapter(
    file_id: str,
    chapter_id: int,
    bold_percentage: float = Query(0.5, ge=0.0, le=0.7)
):
    """
    Get a specific chapter's content with bionic formatting.
    
    Args:
        file_id: Session ID from upload
        chapter_id: Chapter index (0-based)
        bold_percentage: Percentage of each word to bold (0.0-0.7)
                        Use 0.0 to get raw HTML without bionic formatting
    """
    # Retrieve file
    epub_bytes = file_manager.get_file(file_id)
    
    if epub_bytes is None:
        raise HTTPException(
            status_code=404, 
            detail="File not found. It may have expired. Please re-upload."
        )
    
    try:
        # Get formatted chapter content
        chapter_data = get_chapter_content(epub_bytes, chapter_id, bold_percentage)
        return chapter_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chapter loading failed: {str(e)}")

@app.delete("/api/file/{file_id}")
async def delete_file(file_id: str):
    """Delete a file from storage."""
    success = file_manager.delete_file(file_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="File not found")
    
    return {"message": "File deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)