import fitz  # PyMuPDF
from services.bionic_formatter import apply_bionic_formatting

def fix_ligatures(text: str) -> str:
    """
    Replace common ligature characters with their standard equivalents.
    """
    ligature_map = {
        '\ufb01': 'fi',  # ﬁ ligature
        '\ufb02': 'fl',  # ﬂ ligature
        '\ufb00': 'ff',  # ﬀ ligature
        '\ufb03': 'ffi', # ﬃ ligature
        '\ufb04': 'ffl', # ﬄ ligature
        '\ufb05': 'ft',  # ﬅ ligature
        '\ufb06': 'st',  # ﬆ ligature
    }
    
    for ligature, replacement in ligature_map.items():
        text = text.replace(ligature, replacement)
    
    return text

def generate_bionic_pdf(pdf_bytes: bytes, bold_percentage: float = 0.5) -> bytes:
    """
    Generate a new PDF with bionic reading formatting applied.
    
    Args:
        pdf_bytes: Original PDF file content as bytes
        bold_percentage: Percentage of each word to make bold
    
    Returns:
        New PDF with bionic formatting as bytes
    """
    # Open original PDF
    original_pdf = fitz.open(stream=pdf_bytes, filetype="pdf")
    
    # Create new PDF
    new_pdf = fitz.open()
    
    for page_num in range(len(original_pdf)):
        original_page = original_pdf[page_num]
        
        # Create new page with same dimensions
        new_page = new_pdf.new_page(
            width=original_page.rect.width,
            height=original_page.rect.height
        )
        
        # Get text with detailed positioning - use "rawdict" for more accurate positioning
        text_page = original_page.get_text("dict")
        blocks = text_page["blocks"]
        
        for block in blocks:
            if block["type"] == 0:  # Text block
                for line in block["lines"]:
                    # Process each span (text segment with same formatting)
                    line_y = line["bbox"][1]  # Get the baseline Y position
                    
                    for span in line["spans"]:
                        text = span["text"]
                        
                        # Fix ligatures
                        text = fix_ligatures(text)
                        
                        # Get exact positioning
                        x = span["origin"][0]  # Use origin instead of bbox for more accuracy
                        y = span["origin"][1]
                        font_size = span["size"]
                        font_name = span["font"]
                        
                        # Use built-in fonts (we'll map to helvetica family)
                        regular_font = "helv"
                        bold_font = "hebo"
                        
                        # Process word by word
                        words = text.split(' ')
                        current_x = x
                        
                        for i, word in enumerate(words):
                            if not word:  # Skip empty words
                                continue
                                
                            # Apply bionic formatting
                            bold_part, regular_part = apply_bionic_formatting(word, bold_percentage)
                            
                            # Insert bold part
                            if bold_part:
                                new_page.insert_text(
                                    (current_x, y),
                                    bold_part,
                                    fontname=bold_font,
                                    fontsize=font_size,
                                    color=(0, 0, 0)
                                )
                                bold_width = fitz.get_text_length(bold_part, fontname=bold_font, fontsize=font_size)
                                current_x += bold_width
                            
                            # Insert regular part (without trailing space)
                            regular_part_no_space = regular_part.rstrip(' ')
                            if regular_part_no_space:
                                new_page.insert_text(
                                    (current_x, y),
                                    regular_part_no_space,
                                    fontname=regular_font,
                                    fontsize=font_size,
                                    color=(0, 0, 0)
                                )
                                regular_width = fitz.get_text_length(regular_part_no_space, fontname=regular_font, fontsize=font_size)
                                current_x += regular_width
                            
                            # Add space between words
                            if i < len(words) - 1:
                                space_width = fitz.get_text_length(" ", fontname=regular_font, fontsize=font_size)
                                current_x += space_width
            
            elif block["type"] == 1:  # Image block
                # Copy images from original page
                try:
                    img_bbox = fitz.Rect(block["bbox"])
                    # Get all images on the page
                    img_list = original_page.get_images(full=True)
                    
                    for img_index, img_info in enumerate(img_list):
                        xref = img_info[0]
                        # Get the actual image
                        base_image = original_pdf.extract_image(xref)
                        image_bytes = base_image["image"]
                        
                        # Insert image at original position
                        new_page.insert_image(img_bbox, stream=image_bytes)
                        break  # Only insert first image for this block
                except Exception as e:
                    print(f"Could not copy image: {e}")
    
    # Get PDF bytes
    pdf_output = new_pdf.tobytes()
    
    # Close documents
    original_pdf.close()
    new_pdf.close()
    
    return pdf_output