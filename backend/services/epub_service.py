import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
from typing import Dict
import tempfile
import os
import base64

def process_full_epub(epub_bytes: bytes) -> Dict:
    """
    Process an entire EPUB file and return all content as a single HTML document.
    
    Returns:
        Dictionary with metadata and complete book HTML
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
        
        # Combine all chapters into one HTML document
        all_html_parts = []
        
        # Get all document items
        documents = [item for item in book.get_items() if item.get_type() == ebooklib.ITEM_DOCUMENT]
        
        for item in documents:
            content = item.get_content().decode('utf-8')
            soup = BeautifulSoup(content, 'lxml')
            
            # Convert images to base64
            convert_images_to_base64(soup, book)
            
            # Get the body content
            body = soup.find('body')
            if body:
                # Add a chapter separator div
                chapter_div = soup.new_tag('div', **{'class': 'chapter-content'})
                for child in list(body.children):
                    chapter_div.append(child)
                all_html_parts.append(str(chapter_div))
            else:
                all_html_parts.append(str(soup))
        
        # Combine all parts into one HTML
        complete_html = '\n'.join(all_html_parts)
        
        return {
            'title': title,
            'author': author,
            'html_content': complete_html
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