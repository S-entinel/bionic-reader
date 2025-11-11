import fitz  # PyMuPDF

def extract_pdf_content(pdf_bytes: bytes) -> dict:
    """
    Extract text and layout information from a PDF.
    
    Args:
        pdf_bytes: PDF file content as bytes
    
    Returns:
        Dictionary containing page information with text blocks and their positions
    """
    # Open PDF from bytes
    pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
    
    pages_data = []
    page_count = len(pdf_document)
    
    for page_num in range(page_count):
        page = pdf_document[page_num]
        
        # Get page dimensions
        page_rect = page.rect
        page_info = {
            "page_number": page_num + 1,
            "width": page_rect.width,
            "height": page_rect.height,
            "text_blocks": [],
            "images": []
        }
        
        # Extract text blocks with position and font information
        blocks = page.get_text("dict")["blocks"]
        
        for block in blocks:
            # Check if it's a text block (type 0) or image block (type 1)
            if block["type"] == 0:  # Text block
                for line in block["lines"]:
                    for span in line["spans"]:
                        text_block = {
                            "text": span["text"],
                            "x": span["bbox"][0],
                            "y": span["bbox"][1],
                            "width": span["bbox"][2] - span["bbox"][0],
                            "height": span["bbox"][3] - span["bbox"][1],
                            "font_name": span["font"],
                            "font_size": span["size"],
                            "color": span["color"]
                        }
                        page_info["text_blocks"].append(text_block)
            
            elif block["type"] == 1:  # Image block
                image_info = {
                    "x": block["bbox"][0],
                    "y": block["bbox"][1],
                    "width": block["bbox"][2] - block["bbox"][0],
                    "height": block["bbox"][3] - block["bbox"][1]
                }
                page_info["images"].append(image_info)
        
        pages_data.append(page_info)
    
    # Store page_count before closing
    result = {
        "page_count": page_count,
        "pages": pages_data
    }
    
    pdf_document.close()
    
    return result