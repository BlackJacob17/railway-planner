/**
 * KMP (Knuth-Morris-Pratt) string searching algorithm implementation
 * 
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @returns {boolean} - True if pattern is found in text, false otherwise
 */
export const kmpSearch = (text, pattern) => {
  if (!text || !pattern) return false;
  
  const textStr = String(text).toLowerCase();
  const patternStr = String(pattern).toLowerCase().trim();
  
  if (patternStr.length === 0) return true;
  if (textStr.length < patternStr.length) return false;
  
  // Build the longest prefix suffix (lps) array
  const lps = computeLPSArray(patternStr);
  
  let i = 0; // index for text
  let j = 0;  // index for pattern
  
  while (i < textStr.length) {
    if (patternStr[j] === textStr[i]) {
      i++;
      j++;
      
      if (j === patternStr.length) {
        return true; // Pattern found
      }
    } else if (j > 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
  
  return false; // Pattern not found
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
    if (pattern[i] === pattern[len]) {
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
 * @returns {boolean} - True if pattern is found in any of the specified fields
 */
export const searchInObject = (item, fields, pattern) => {
  if (!pattern || pattern.trim() === '') return true;
  
  return fields.some(field => {
    const value = item[field];
    if (value === undefined || value === null) return false;
    return kmpSearch(String(value), pattern);
  });
};
