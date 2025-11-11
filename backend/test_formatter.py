from services.bionic_formatter import apply_bionic_formatting, format_text

# Test individual words
test_words = [
    "I",
    "am",
    "reading",
    "this",
    "document",
    "hello!",
    "world?",
    "(test)",
    "it's",
    "well-being"
]

print("Testing individual words:")
print("-" * 50)
for word in test_words:
    bold, regular = apply_bionic_formatting(word)
    print(f"'{word}' -> Bold: '{bold}' | Regular: '{regular}'")
    print(f"  Combined: '{bold}{regular}'")
    print()

# Test a full sentence
print("\nTesting full sentence:")
print("-" * 50)
sentence = "The quick brown fox jumps over the lazy dog"
formatted = format_text(sentence)
print(f"Original: {sentence}")
print("\nFormatted:")
for bold, regular in formatted:
    print(f"  '{bold}' + '{regular}'", end=" ")
print("\n")

# Reconstruct the sentence
reconstructed = "".join([bold + regular for bold, regular in formatted])
print(f"Reconstructed: {reconstructed}")