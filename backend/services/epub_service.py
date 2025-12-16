import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
from typing import List, Dict
import re
import io
import tempfile
import os
import base64

def extract_epub_data(epub_bytes: bytes) -> Dict:
    """
    Extract chapters and metadata from an EPUB file.
    
    Returns:
        Dictionary with metadata and chapter list
    """
    # Write bytes to a temporary file
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
                # Get chapter content
                content = item.get_content().decode('utf-8')
                
                # Parse with BeautifulSoup to get title
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
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def convert_images_to_base64(soup: BeautifulSoup, book: epub.EpubBook):
    """
    Convert all image tags in the HTML to base64 data URLs.
    This allows images to display without needing separate image serving endpoints.
    """
    # Find all img tags
    for img_tag in soup.find_all('img'):
        src = img_tag.get('src')
        if not src:
            continue
        
        # Clean up the src path (remove ../ and leading /)
        src = src.lstrip('/')
        src = src.replace('../', '')
        
        # Try to find the image in the EPUB
        image_item = None
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_IMAGE:
                item_name = item.get_name()
                # Check if the src matches the item name or ends with the same filename
                if src in item_name or item_name.endswith(src.split('/')[-1]):
                    image_item = item
                    break
        
        if image_item:
            try:
                # Get image content
                image_content = image_item.get_content()
                
                # Determine mime type based on file extension
                mime_type = 'image/jpeg'  # default
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
                
                # Create data URL
                data_url = f"data:{mime_type};base64,{base64_data}"
                
                # Update the img tag
                img_tag['src'] = data_url
                
            except Exception as e:
                print(f"Failed to convert image {src}: {e}")
                # Leave the src as-is if conversion fails


def get_chapter_content(epub_bytes: bytes, chapter_id: int, bold_percentage: float = 0.5) -> Dict:
    """
    Get a specific chapter's content with bionic formatting applied.
    
    Args:
        epub_bytes: EPUB file content
        chapter_id: Chapter index (0-based)
        bold_percentage: Percentage of each word to bold
    
    Returns:
        Dictionary with chapter HTML content
    """
    # Write bytes to a temporary file
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
        
        # Parse and format the HTML
        soup = BeautifulSoup(content, 'lxml')
        
        # Convert images to base64 data URLs BEFORE applying bionic formatting
        convert_images_to_base64(soup, book)
        
        # Apply bionic formatting to text nodes
        apply_bionic_to_html(soup, bold_percentage)
        
        # Get the body content or full HTML
        body = soup.find('body')
        formatted_html = str(body) if body else str(soup)
        
        return {
            'chapter_id': chapter_id,
            'html_content': formatted_html
        }
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def apply_bionic_to_html(soup: BeautifulSoup, bold_percentage: float):
    """
    Apply bionic formatting to all text nodes in the HTML.
    Modifies the soup object in place.
    """
    # Find all text nodes
    for element in soup.find_all(text=True):
        # Skip script and style tags
        if element.parent.name in ['script', 'style', 'title']:
            continue
        
        # Skip if it's just whitespace
        if not element.strip():
            continue
        
        # Format the text
        formatted = format_text_bionic(element, bold_percentage)
        element.replace_with(formatted)


def format_text_bionic(text: str, bold_percentage: float) -> BeautifulSoup:
    """
    Format text with bionic reading - bold the first part of each word.
    Returns a BeautifulSoup object with formatted spans.
    """
    words = text.split()
    formatted_parts = []
    
    for i, word in enumerate(words):
        if not word:
            continue
        
        # Separate punctuation
        match = re.match(r'^(\W*)(\w+)(\W*)$', word)
        
        if match:
            prefix, core_word, suffix = match.groups()
            
            # Calculate bold portion
            word_len = len(core_word)
            if word_len <= 2:
                bold_count = 1
            elif word_len <= 5:
                bold_count = 2
            else:
                bold_count = max(1, int(word_len * bold_percentage))
            
            bold_part = core_word[:bold_count]
            regular_part = core_word[bold_count:]
            
            # Create formatted word
            formatted_word = f'{prefix}<strong>{bold_part}</strong>{regular_part}{suffix}'
            formatted_parts.append(formatted_word)
        else:
            # If no match, just add the word as-is
            formatted_parts.append(word)
        
        # Add space between words (except last word)
        if i < len(words) - 1:
            formatted_parts.append(' ')
    
    # Join and parse as HTML
    formatted_html = ''.join(formatted_parts)
    return BeautifulSoup(formatted_html, 'html.parser')