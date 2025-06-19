const PriorityQueue = require('../utils/PriorityQueue');

class PathfindingService {
  constructor() {
    this.graph = new Map();
    this.stations = new Map();
  }

  initializeGraph(stations, routes) {
    // Add all stations to the graph
    stations.forEach(station => {
      this.addStation(station._id.toString(), station);
    });

    // Add connections between stations
    routes.forEach(route => {
      const { source, destination, distance, trains } = route;
      this.addConnection(
        source.toString(),
        destination.toString(),
        distance,
        { trains }
      );
    });
  }


  addStation(stationId, stationData) {
    if (!this.graph.has(stationId)) {
      this.graph.set(stationId, []);
      this.stations.set(stationId, stationData);
    }
  }

  addConnection(source, destination, weight, data = {}) {
    if (!this.graph.has(source) || !this.graph.has(destination)) {
      throw new Error('Source or destination station not found');
    }
    
    this.graph.get(source).push({ 
      node: destination, 
      weight,
      ...data
    });
  }

  async findShortestPath(start, end, options = {}) {
    const { maxStops = 10 } = options;
    const distances = {};
    const previous = {};
    const pq = new PriorityQueue();
    const visited = new Set();
    const stops = {};

    // Initialize
    for (const station of this.graph.keys()) {
      distances[station] = station === start ? 0 : Infinity;
      previous[station] = null;
      stops[station] = 0;
      pq.enqueue(station, distances[station]);
    }

    while (!pq.isEmpty()) {
      const current = pq.dequeue().element;
      
      if (current === end) break;
      if (visited.has(current)) continue;
      
      visited.add(current);
      if (stops[current] >= maxStops) continue;

      const neighbors = this.graph.get(current) || [];
      
      for (const neighbor of neighbors) {
        const { node, weight, ...edgeData } = neighbor;
        const totalDistance = distances[current] + weight;
        
        if (totalDistance < distances[node]) {
          distances[node] = totalDistance;
          previous[node] = {
            from: current,
            ...edgeData
          };
          stops[node] = stops[current] + 1;
          
          if (pq.has(node)) {
            pq.items = pq.items.filter(item => item.element !== node);
          }
          pq.enqueue(node, totalDistance);
        }
      }
    }

    return this._reconstructPath(start, end, previous, distances);
  }

  _reconstructPath(start, end, previous, distances) {
    const path = [];
    let current = end;
    
    if (previous[current] === null && current !== start) {
      return null;
    }

    while (current !== null) {
      path.unshift({
        station: this.stations.get(current),
        ...(previous[current] || {})
      });
      current = previous[current]?.from;
    }

    return {
      path,
      totalDistance: distances[end],
      totalStops: path.length - 1
    };
  }

  findAllPaths(start, end, maxPaths = 5) {
    const paths = [];
    const visited = new Set();
    
    const dfs = (current, path, distance, stops) => {
      if (stops > 5) return;
      if (current === end) {
        paths.push({
          path: [...path, this.stations.get(current)],
          totalDistance: distance,
          totalStops: stops
        });
        return;
      }
      
      visited.add(current);
      const neighbors = this.graph.get(current) || [];
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.node)) {
          dfs(
            neighbor.node,
            [...path, { ...this.stations.get(current), ...neighbor }],
            distance + neighbor.weight,
            stops + 1
          );
        }
      }
      
      visited.delete(current);
    };
    
    dfs(start, [], 0, 0);
    
    return paths
      .sort((a, b) => a.totalDistance - b.totalDistance)
      .slice(0, maxPaths);
  }
}

module.exports = new PathfindingService();
