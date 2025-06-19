/**
 * TrieNode class for each character in the Trie
 */
class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.stationData = null;
  }
}

/**
 * StationTrie for efficient station name autocomplete
 */
class StationTrie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Insert a station name and its data into the Trie
   * @param {string} stationName
   * @param {object} stationData
   */
  insert(stationName, stationData) {
    let current = this.root;
    for (let char of stationName.toLowerCase()) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }
    current.isEndOfWord = true;
    current.stationData = stationData;
  }

  /**
   * Search for all stations matching the prefix
   * @param {string} prefix
   * @returns {Array<{name: string, data: object}>}
   */
  search(prefix) {
    let current = this.root;
    for (let char of prefix.toLowerCase()) {
      if (!current.children[char]) {
        return [];
      }
      current = current.children[char];
    }
    return this.getAllWords(current, prefix);
  }

  /**
   * Recursively collect all station names and data from a node
   * @param {TrieNode} node
   * @param {string} prefix
   * @returns {Array<{name: string, data: object}>}
   */
  getAllWords(node, prefix) {
    const results = [];
    if (node.isEndOfWord) {
      results.push({ name: prefix, data: node.stationData });
    }
    for (let char in node.children) {
      results.push(...this.getAllWords(node.children[char], prefix + char));
    }
    return results;
  }
}

export { TrieNode, StationTrie };
