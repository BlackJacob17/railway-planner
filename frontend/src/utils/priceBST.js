class PriceNode {
    constructor(price, ticket) {
      this.price = price;
      this.tickets = [ticket];
      this.left = null;
      this.right = null;
    }
  }
  
  class TicketPriceBST {
    constructor() {
      this.root = null;
    }
  
    // Insert a new ticket into the BST
    insert(ticket) {
      // Skip if ticket doesn't have a price
      if (ticket.price === undefined || ticket.price === null) return;
      
      const newNode = new PriceNode(ticket.price, ticket);
      
      if (!this.root) {
        this.root = newNode;
        return;
      }
  
      let current = this.root;
      while (true) {
        if (ticket.price < current.price) {
          if (!current.left) {
            current.left = newNode;
            break;
          }
          current = current.left;
        } else if (ticket.price > current.price) {
          if (!current.right) {
            current.right = newNode;
            break;
          }
          current = current.right;
        } else {
          // Handle duplicate prices
          current.tickets.push(ticket);
          break;
        }
      }
    }
  
    // Find all tickets within a price range
    findTicketsInPriceRange(min, max) {
      const results = [];
      this._searchRange(this.root, min, max, results);
      return results.flat();
    }
  
    // Helper method for range search
    _searchRange(node, min, max, results) {
      if (!node) return;
  
      // Search left subtree if needed
      if (node.price > min) {
        this._searchRange(node.left, min, max, results);
      }
  
      // Check current node
      if (node.price >= min && node.price <= max) {
        results.push(...node.tickets);
      }
  
      // Search right subtree if needed
      if (node.price < max) {
        this._searchRange(node.right, min, max, results);
      }
    }
  
    // Get minimum price in the BST
    getMinPrice() {
      if (!this.root) return 0;
      let current = this.root;
      while (current.left) {
        current = current.left;
      }
      return current.price;
    }
  
    // Get maximum price in the BST
    getMaxPrice() {
      if (!this.root) return 0;
      let current = this.root;
      while (current.right) {
        current = current.right;
      }
      return current.price;
    }
  }
  
  // Helper function to create and populate BST from tickets
  function createPriceBST(tickets) {
    const bst = new TicketPriceBST();
    tickets.forEach(ticket => bst.insert(ticket));
    return bst;
  }
  
  export default {
    TicketPriceBST,
    createPriceBST
  };
  