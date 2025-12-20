import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
from typing import Dict
import tempfile
import os
import base64

def extract_epub_data(epub_bytes: bytes) -> Dict:
    """
    Extract chapters and metadata from an EPUB file.
    
    Returns:
        Dictionary with metadata and chapter list
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix='.epub') as tmp_file:
        tmp_file.write(epub_bytes)
        tmp_path = tmp_file.name
    
    try:
        book = epub.read_epub(tmp_path)
        
        # Get metadata
        title = book.get_metadata('DC', 'title')
        title = title[0][0] if title else 'Unknown'
        
        author = book.get_metadata('DC', 'creator')
        author = author[0][0] if author else 'Unknown'
        
        # Extract chapters
        chapters = []
        chapter_index = 0
        
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                content = item.get_content().decode('utf-8')
                soup = BeautifulSoup(content, 'lxml')
                
                # Try to find chapter title
                title_tag = soup.find(['h1', 'h2', 'h3', 'title'])
                chapter_title = title_tag.get_text().strip() if title_tag else f"Chapter {chapter_index + 1}"
                
                chapters.append({
                    'id': chapter_index,
                    'title': chapter_title,
                    'file_name': item.get_name()
                })
                
                chapter_index += 1
        
        return {
            'title': title,
            'author': author,
            'total_chapters': len(chapters),
            'chapters': chapters
        }
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def convert_images_to_base64(soup: BeautifulSoup, book: epub.EpubBook):
    """
    Convert all image tags in the HTML to base64 data URLs.
    This allows images to display without needing separate image serving endpoints.
    """
    for img_tag in soup.find_all('img'):
        src = img_tag.get('src')
        if not src:
            continue
        
        # Clean up the src path
        src = src.lstrip('/').replace('../', '')
        
        # Find the image in the EPUB
        image_item = None
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_IMAGE:
                item_name = item.get_name()
                if src in item_name or item_name.endswith(src.split('/')[-1]):
                    image_item = item
                    break
        
        if image_item:
            try:
                image_content = image_item.get_content()
                
                # Determine mime type
                mime_type = 'image/jpeg'
                if item_name.lower().endswith('.png'):
                    mime_type = 'image/png'
                elif item_name.lower().endswith('.gif'):
                    mime_type = 'image/gif'
                elif item_name.lower().endswith('.svg'):
                    mime_type = 'image/svg+xml'
                elif item_name.lower().endswith('.webp'):
                    mime_type = 'image/webp'
                
                # Convert to base64
                base64_data = base64.b64encode(image_content).decode('utf-8')
                data_url = f"data:{mime_type};base64,{base64_data}"
                
                img_tag['src'] = data_url
                
            except Exception as e:
                print(f"Failed to convert image {src}: {e}")


def get_chapter_content(epub_bytes: bytes, chapter_id: int, bold_percentage: float = 0.5) -> Dict:
    """
    Get a specific chapter's content as clean HTML.
    
    Args:
        epub_bytes: EPUB file content
        chapter_id: Chapter index (0-based)
        bold_percentage: Kept for API compatibility but not used (formatting is client-side)
    
    Returns:
        Dictionary with chapter HTML content
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix='.epub') as tmp_file:
        tmp_file.write(epub_bytes)
        tmp_path = tmp_file.name
    
    try:
        book = epub.read_epub(tmp_path)
        
        # Get all document items
        documents = [item for item in book.get_items() if item.get_type() == ebooklib.ITEM_DOCUMENT]
        
        if chapter_id < 0 or chapter_id >= len(documents):
            raise ValueError(f"Invalid chapter ID. Book has {len(documents)} chapters.")
        
        # Get chapter content
        item = documents[chapter_id]
        content = item.get_content().decode('utf-8')
        
        # Parse the HTML
        soup = BeautifulSoup(content, 'lxml')
        
        # Convert images to base64 data URLs
        convert_images_to_base64(soup, book)
        
        # Get the body content or full HTML
        body = soup.find('body')
        formatted_html = str(body) if body else str(soup)
        
        return {
            'chapter_id': chapter_id,
            'html_content': formatted_html
        }
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)