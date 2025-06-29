// KMP Algorithm Implementation

// Compute the longest prefix which is also suffix (LPS) array
function computeLPS(pattern) {
    const lps = new Array(pattern.length).fill(0);
    let length = 0;
    let i = 1;
    
    while (i < pattern.length) {
      if (pattern[i] === pattern[length]) {
        length++;
        lps[i] = length;
        i++;
      } else {
        if (length !== 0) {
          length = lps[length - 1];
        } else {
          lps[i] = 0;
          i++;
        }
      }
    }
    return lps;
  }
  
  // Find all occurrences of pattern in text using KMP
  export function findAllOccurrences(text, pattern) {
    if (!text || !pattern || pattern.length === 0) return [];
    
    const lps = computeLPS(pattern);
    const occurrences = [];
    let i = 0; // index for text
    let j = 0; // index for pattern
    
    while (i < text.length) {
      if (pattern[j] === text[i]) {
        i++;
        j++;
        
        if (j === pattern.length) {
          // Found an occurrence
          occurrences.push(i - j);
          j = lps[j - 1];
        }
      } else {
        if (j !== 0) {
          j = lps[j - 1];
        } else {
          i++;
        }
      }
    }
    
    return occurrences;
  }
  
  // Highlight pattern in text with a span
  // Returns a React node with highlighted matches
  export function highlightPattern(text, pattern) {
    if (!text || !pattern || pattern.length === 0) return text;
    
    const lowerText = text.toLowerCase();
    const lowerPattern = pattern.toLowerCase();
    const occurrences = findAllOccurrences(lowerText, lowerPattern);
    
    if (occurrences.length === 0) return text;
    
    const result = [];
    let lastIndex = 0;
    
    occurrences.forEach((startIndex) => {
      const endIndex = startIndex + pattern.length;
      
      // Add text before the match
      if (startIndex > lastIndex) {
        result.push(text.substring(lastIndex, startIndex));
      }
      
      // Add the highlighted match
      result.push(
        <span key={`${startIndex}-${endIndex}`} style={{ backgroundColor: '#ffeb3b', color: '#000' }}>
          {text.substring(startIndex, endIndex)}
        </span>
      );
      
      lastIndex = endIndex;
    });
    
    // Add remaining text after the last match
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }
    
    return result;
  }
  
  // Check if text contains pattern (case-insensitive)
  export function containsPattern(text, pattern) {
    if (!text || !pattern) return false;
    const lowerText = text.toLowerCase();
    const lowerPattern = pattern.toLowerCase();
    return findAllOccurrences(lowerText, lowerPattern).length > 0;
  }
  