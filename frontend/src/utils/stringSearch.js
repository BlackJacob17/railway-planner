/**
 * KMP (Knuth-Morris-Pratt) string searching algorithm implementation
 * 
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @returns {number[]} - Array of starting indices where pattern is found
 */
const kmpSearchIndices = (text, pattern) => {
  if (!text || !pattern) return [];
  
  const textStr = String(text);
  const patternStr = String(pattern).trim();
  const result = [];
  
  if (patternStr.length === 0 || textStr.length < patternStr.length) return result;
  
  // Build the longest prefix suffix (lps) array
  const lps = computeLPSArray(patternStr);
  
  let i = 0; // index for text
  let j = 0;  // index for pattern
  
  while (i < textStr.length) {
    if (patternStr[j].toLowerCase() === textStr[i].toLowerCase()) {
      i++;
      j++;
      
      if (j === patternStr.length) {
        // Pattern found at index i-j
        result.push(i - j);
        j = lps[j - 1];
      }
    } else if (j > 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
  
  return result;
};

/**
 * Check if pattern exists in text using KMP
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @returns {boolean} - True if pattern is found in text
 */
export const kmpSearch = (text, pattern) => {
  return kmpSearchIndices(text, pattern).length > 0;
};

/**
 * Highlight all occurrences of pattern in text
 * @param {string} text - The text to highlight in
 * @param {string} pattern - The pattern to highlight
 * @returns {React.ReactNode} - Text with highlighted matches
 */
export const highlightPattern = (text, pattern) => {
  if (!text || !pattern) return text;
  
  const textStr = String(text);
  const patternStr = String(pattern).trim();
  
  if (patternStr.length === 0 || textStr.length < patternStr.length) {
    return textStr;
  }
  
  const indices = kmpSearchIndices(textStr, patternStr);
  
  if (indices.length === 0) return textStr;
  
  const result = [];
  let lastIndex = 0;
  
  indices.forEach((startIndex, i) => {
    // Add text before the match
    if (startIndex > lastIndex) {
      result.push(textStr.substring(lastIndex, startIndex));
    }
    
    // Add the highlighted match
    result.push(
      <mark key={i} style={{ backgroundColor: '#ffeb3b', padding: '0 2px', borderRadius: '3px' }}>
        {textStr.substring(startIndex, startIndex + patternStr.length)}
      </mark>
    );
    
    lastIndex = startIndex + patternStr.length;
  });
  
  // Add remaining text after last match
  if (lastIndex < textStr.length) {
    result.push(textStr.substring(lastIndex));
  }
  
  return result.length > 0 ? result : textStr;
};

/**
 * Computes the Longest Prefix Suffix (LPS) array for KMP algorithm
 * @param {string} pattern - The pattern to compute LPS for
 * @returns {number[]} - The LPS array
 */
const computeLPSArray = (pattern) => {
  const lps = new Array(pattern.length).fill(0);
  let len = 0; // length of the previous longest prefix suffix
  let i = 1;
  
  while (i < pattern.length) {
    if (pattern[i].toLowerCase() === pattern[len].toLowerCase()) {
      len++;
      lps[i] = len;
      i++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
  }
  
  return lps;
};

/**
 * Search for a pattern in multiple fields of an object using KMP
 * @param {Object} item - The item to search in
 * @param {string[]} fields - Array of field names to search in
 * @param {string} pattern - The pattern to search for
 * @param {boolean} highlight - Whether to return highlighted matches
 * @returns {Object} - Object with match status and highlighted fields if requested
 */
export const searchInObject = (item, fields, pattern, highlight = false) => {
  if (!pattern || pattern.trim() === '') {
    return { match: true };
  }
  
  const result = {
    match: false,
    highlighted: {}
  };
  
  fields.forEach(field => {
    const value = item[field];
    if (value === undefined || value === null) return;
    
    const strValue = String(value);
    if (kmpSearch(strValue, pattern)) {
      result.match = true;
      if (highlight) {
        result.highlighted[field] = highlightPattern(strValue, pattern);
      }
    } else if (highlight) {
      result.highlighted[field] = strValue;
    }
  });
  
  return result;
};
