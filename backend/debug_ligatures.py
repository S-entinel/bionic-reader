import fitz

pdf_path = "test.pdf"

with open(pdf_path, "rb") as f:
    pdf_bytes = f.read()

pdf = fitz.open(stream=pdf_bytes, filetype="pdf")
page = pdf[0]
blocks = page.get_text("dict")["blocks"]

print("Checking ALL special characters:")
print("-" * 50)

for block in blocks:
    if block["type"] == 0:
        for line in block["lines"]:
            for span in line["spans"]:
                text = span["text"]
                
                # Show character codes for any special or unexpected characters
                for char in text:
                    if char == '+' or ord(char) > 127:  # Non-ASCII or plus sign
                        print(f"Char: '{char}' in word context")
                        print(f"  Unicode: U+{ord(char):04X} (decimal {ord(char)})")
                        # Show surrounding context
                        idx = text.index(char)
                        start = max(0, idx - 3)
                        end = min(len(text), idx + 4)
                        print(f"  Context: ...{text[start:end]}...")
                        print()