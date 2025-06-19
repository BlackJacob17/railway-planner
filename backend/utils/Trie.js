class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.popularity = 0;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this.suggestions = [];
  }

  insert(word, popularity = 1) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.popularity += popularity;
  }

  search(prefix) {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    this.suggestions = [];
    this._findAllWords(node, prefix);
    return this._getSortedSuggestions();
  }

  _findAllWords(node, prefix) {
    if (node.isEndOfWord) {
      this.suggestions.push({
        word: prefix,
        popularity: node.popularity
      });
    }
    for (const [char, childNode] of Object.entries(node.children)) {
      this._findAllWords(childNode, prefix + char);
    }
  }

  _getSortedSuggestions() {
    return this.suggestions
      .sort((a, b) => b.popularity - a.popularity)
      .map(item => item.word);
  }
}

module.exports = Trie;
