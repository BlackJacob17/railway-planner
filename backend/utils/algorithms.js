// backend/utils/algorithms.js

// KMP Algorithm for pattern searching in reviews
class KMP {
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
      const lps = KMP.computeLPSArray(pattern);
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
  }
  
  // Trie implementation for autocomplete
  class TrieNode {
    constructor() {
      this.children = {};
      this.isEndOfWord = false;
    }
  }
  
  class Trie {
    constructor() {
      this.root = new TrieNode();
    }
  
    insert(word) {
      let node = this.root;
      for (const char of word.toLowerCase()) {
        if (!node.children[char]) {
          node.children[char] = new TrieNode();
        }
        node = node.children[char];
      }
      node.isEndOfWord = true;
    }
  
    search(prefix) {
      let node = this.root;
      for (const char of prefix.toLowerCase()) {
        if (!node.children[char]) {
          return [];
        }
        node = node.children[char];
      }
      return this._getAllWords(node, prefix);
    }
  
    _getAllWords(node, prefix) {
      const words = [];
      if (node.isEndOfWord) {
        words.push(prefix);
      }
      for (const [char, childNode] of Object.entries(node.children)) {
        words.push(...this._getAllWords(childNode, prefix + char));
      }
      return words;
    }
  }
  
  // Quicksort implementation for sorting journeys
  function quickSort(arr, compareFn = (a, b) => a - b) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[0];
    const left = [];
    const right = [];
    
    for (let i = 1; i < arr.length; i++) {
      if (compareFn(arr[i], pivot) < 0) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }
    
    return [...quickSort(left, compareFn), pivot, ...quickSort(right, compareFn)];
  }
  
  // Graph algorithms for journey planning
  class Graph {
    constructor() {
      this.adjacencyList = new Map();
    }
  
    addNode(station) {
      if (!this.adjacencyList.has(station)) {
        this.adjacencyList.set(station, []);
      }
    }
  
    addEdge(source, destination, weight, train) {
      this.adjacencyList.get(source).push({ node: destination, weight, train });
    }
  
    // Dijkstra's algorithm for shortest path
    findShortestPath(start, end) {
      const distances = {};
      const previous = {};
      const nodes = new Set();
      const path = [];
      let smallest;
  
      // Initialize distances
      this.adjacencyList.forEach((_, vertex) => {
        if (vertex === start) {
          distances[vertex] = 0;
        } else {
          distances[vertex] = Infinity;
        }
        nodes.add(vertex);
      });
  
      while (nodes.size) {
        // Find node with smallest distance
        smallest = null;
        for (const node of nodes) {
          if (smallest === null || distances[node] < distances[smallest]) {
            smallest = node;
          }
        }
  
        if (smallest === end) {
          // Build path
          while (previous[smallest]) {
            path.push(smallest);
            smallest = previous[smallest];
          }
          break;
        }
  
        if (distances[smallest] === Infinity) {
          break;
        }
  
        // Update distances to neighbors
        for (const neighbor of this.adjacencyList.get(smallest)) {
          const candidate = distances[smallest] + neighbor.weight;
          if (candidate < distances[neighbor.node]) {
            distances[neighbor.node] = candidate;
            previous[neighbor.node] = { 
              from: smallest, 
              train: neighbor.train,
              distance: neighbor.weight
            };
          }
        }
  
        nodes.delete(smallest);
      }
  
      // Format the result
      const result = [];
      let current = end;
      while (previous[current]) {
        result.unshift({
          from: previous[current].from,
          to: current,
          train: previous[current].train,
          distance: previous[current].distance
        });
        current = previous[current].from;
      }
  
      return result;
    }
  
    // BFS for finding all possible paths
    findAllPaths(start, end, maxStops = 5) {
      const paths = [];
      const queue = [[start, []]];
      const visited = new Set();
  
      while (queue.length) {
        const [current, path] = queue.shift();
        visited.add(current);
  
        if (current === end && path.length > 0) {
          paths.push([...path, current]);
          continue;
        }
  
        if (path.length >= maxStops) {
          continue;
        }
  
        for (const neighbor of this.adjacencyList.get(current) || []) {
          if (!visited.has(neighbor.node)) {
            queue.push([neighbor.node, [...path, current]]);
          }
        }
      }
  
      return paths;
    }
  }
  
  module.exports = {
    KMP,
    Trie,
    quickSort,
    Graph
  };