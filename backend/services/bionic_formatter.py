def apply_bionic_formatting(word: str, bold_percentage: float = 0.5) -> tuple[str, str]:
    """
    Apply bionic reading formatting to a word.
    
    Args:
        word: The word to format
        bold_percentage: Percentage of the word to make bold (0.3 to 0.7)
    
    Returns:
        Tuple of (bold_part, regular_part)
        Example: "reading" -> ("rea", "ding")
    """
    # If empty or just whitespace, return as is
    if not word or not word.strip():
        return (word, "")
    
    clean_word = word.strip()
    
    # Separate punctuation from the actual word
    start_punct = ""
    end_punct = ""
    
    # Get leading punctuation
    i = 0
    while i < len(clean_word) and not clean_word[i].isalnum():
        start_punct += clean_word[i]
        i += 1
    
    # Get trailing punctuation
    j = len(clean_word) - 1
    while j >= i and not clean_word[j].isalnum():
        end_punct = clean_word[j] + end_punct
        j -= 1
    
    # Extract the actual word without punctuation
    actual_word = clean_word[i:j+1]
    
    # If no actual word content (all punctuation), return as is
    if not actual_word:
        return (word, "")
    
    # Calculate how many characters to bold
    word_length = len(actual_word)
    
    if word_length <= 2:
        bold_count = 1
    elif word_length <= 5:
        bold_count = 2
    else:
        bold_count = max(1, int(word_length * bold_percentage))
    
    # Split the word
    bold_part = actual_word[:bold_count]
    regular_part = actual_word[bold_count:]
    
    # Reconstruct with punctuation
    full_bold = start_punct + bold_part
    full_regular = regular_part + end_punct
    
    return (full_bold, full_regular)


def format_text(text: str, bold_percentage: float = 0.5) -> list[tuple[str, str]]:
    """
    Format an entire text string into bionic reading format.
    
    Args:
        text: The text to format
        bold_percentage: Percentage of each word to make bold
    
    Returns:
        List of tuples (bold_part, regular_part) for each word
    """
    words = text.split(' ')
    formatted_words = []
    
    for i, word in enumerate(words):
        bold, regular = apply_bionic_formatting(word, bold_percentage)
        # Add space after each word except the last one
        if i < len(words) - 1:
            regular = regular + ' '
        formatted_words.append((bold, regular))
    
    return formatted_words