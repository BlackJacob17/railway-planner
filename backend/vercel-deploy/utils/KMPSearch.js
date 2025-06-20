class KMPSearch {
  static computeLPSArray(pattern) {
    const lps = Array(pattern.length).fill(0);
    let len = 0;
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
  }

  static search(text, pattern) {
    if (!text || !pattern) return [];
    const positions = [];
    const M = pattern.length;
    const N = text.length;
    const lps = this.computeLPSArray(pattern);
    let i = 0; // index for text
    let j = 0; // index for pattern

    while (i < N) {
      if (pattern[j] === text[i]) {
        i++;
        j++;
      }

      if (j === M) {
        positions.push(i - j);
        j = lps[j - 1];
      } else if (i < N && pattern[j] !== text[i]) {
        if (j !== 0) {
          j = lps[j - 1];
        } else {
          i++;
        }
      }
    }
    return positions;
  }

  static highlightText(text, pattern, highlightClass = 'highlight') {
    const positions = this.search(text.toLowerCase(), pattern.toLowerCase());
    if (positions.length === 0) return text;
    
    let result = '';
    let lastIndex = 0;
    
    positions.forEach(pos => {
      result += text.substring(lastIndex, pos);
      result += `<span class="${highlightClass}">`;
      result += text.substring(pos, pos + pattern.length);
      result += '</span>';
      lastIndex = pos + pattern.length;
    });
    
    result += text.substring(lastIndex);
    return result;
  }
}

module.exports = KMPSearch;
