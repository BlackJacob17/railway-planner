# 🚆 Railway Planner - Advanced Railway Management System

Railway Planner is a comprehensive railway management system that provides an efficient way to search for trains, book tickets, and manage railway operations. The system features advanced algorithms for optimal performance and a user-friendly interface for both administrators and regular users.

## 🌟 Key Features

### For Users
- User authentication and authorization
- Search trains between stations
- View train schedules and availability
- Book and manage tickets
- View and submit reviews
- Track journey details

### For Administrators
- Manage trains and their schedules
- Manage stations and routes
- View and manage bookings
- Generate reports
- Manage users and their permissions

## 🛠️ Tech Stack

### Frontend
- **React.js** - Frontend library
- **Redux Toolkit** - State management
- **Material-UI** - UI components and theming
- **React Router** - Navigation
- **Axios** - HTTP client
- **Formik & Yup** - Form handling and validation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## 🚂 Key Algorithm Implementations

### 1. QuickSort for Station Scheduling
```javascript
// Implementation in backend/utils/QuickSort.js
class QuickSort {
  static sort(arr, compareFn) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[0];
    const left = [];
    const right = [];
    
    for (let i = 1; i < arr.length; i++) {
      if (compareFn(arr[i], pivot) <= 0) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }
    
    return [
      ...this.sort(left, compareFn),
      pivot,
      ...this.sort(right, compareFn)
    ];
  }
  // ... more methods
}
```
**Purpose**: Efficiently sorts stations by arrival and departure times with O(n log n) average time complexity, ensuring optimal performance even with large datasets.

### 2. KMP Algorithm for Train Search
```javascript
// Implementation in backend/utils/KMPSearch.js
class KMPSearch {
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
  // ... more methods
}
```
**Purpose**: Implements the Knuth-Morris-Pratt algorithm for efficient string searching, providing O(n+m) time complexity for searching train names and numbers.

### 3. Trie Data Structure for Station Search
```javascript
// Implementation in backend/utils/Trie.js
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
  // ... more methods
}
```
**Purpose**: Implements a Trie data structure for efficient station name search with auto-suggestions, providing O(m) search time complexity where m is the length of the search string.

## 📊 Database Schema

### Collections
1. **Users**
   - User details
   - Authentication info
   - Role (admin/user)
   - Booking history

2. **Trains**
   - Train details
   - Schedule
   - Available seats
   - Route information

3. **Stations**
   - Station details
   - Location data
   - Platform information

4. **Bookings**
   - Booking details
   - Passenger information
   - Payment status
   - Journey details

5. **Reviews**
   - User reviews
   - Ratings
   - Timestamps

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/railway-planner.git
   cd railway-planner
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   - Create a `.env` file in the backend directory with the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5000
     NODE_ENV=development
     ```

5. **Start the development servers**
   - Backend:
     ```bash
     cd backend
     npm run dev
     ```
   - Frontend:
     ```bash
     cd frontend
     npm start
     ```

## 📸 Screenshots

### Train Search Page
[Add screenshot of train search page]
*Figure 1: Search for trains between stations*

### Station Search with Auto-suggestions
[Add screenshot of station search with suggestions]
*Figure 2: Real-time station search using Trie implementation*

### Booking Management
[Add screenshot of booking management]
*Figure 3: User booking management interface*

### Admin Dashboard
[Add screenshot of admin dashboard]
*Figure 4: Admin dashboard for managing railway operations*

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Special thanks to all contributors who helped in building this project.
- Icons by [Material-UI](https://material-ui.com/)
- UI components by [Material-UI](https://material-ui.com/)

---

