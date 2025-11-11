from services.pdf_extractor import extract_pdf_content
import json

# You'll need a test PDF file
test_pdf_path = "test.pdf"  # Replace with test PDF file

try:
    with open(test_pdf_path, "rb") as f:
        pdf_bytes = f.read()
    
    print("Extracting PDF content...")
    result = extract_pdf_content(pdf_bytes)
    
    print(f"\nPDF has {result['page_count']} page(s)")
    print("\nFirst page information:")
    print(f"Width: {result['pages'][0]['width']}")
    print(f"Height: {result['pages'][0]['height']}")
    print(f"Text blocks found: {len(result['pages'][0]['text_blocks'])}")
    print(f"Images found: {len(result['pages'][0]['images'])}")
    
    # Show first few text blocks
    print("\nFirst 5 text blocks:")
    for i, block in enumerate(result['pages'][0]['text_blocks'][:5]):
        print(f"\n{i+1}. Text: '{block['text']}'")
        print(f"   Position: ({block['x']:.2f}, {block['y']:.2f})")
        print(f"   Font: {block['font_name']} - Size: {block['font_size']}")
    
except FileNotFoundError:
    print(f"Error: Could not find '{test_pdf_path}'")
    print("Please create a test PDF or update the path in the script")
except Exception as e:
    print(f"Error: {e}")