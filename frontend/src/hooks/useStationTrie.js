import { useState, useEffect } from 'react';
import { StationTrie } from '../utils/StationTrie';
import { stationsAPI } from '../services/api';

/**
 * Custom hook to fetch stations from API and build a StationTrie
 * @returns {{ trie: StationTrie|null, stations: Array, loading: boolean, error: any }}
 */
export const useStationTrie = () => {
  const [trie, setTrie] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const { data } = await stationsAPI.getStations();
      
      // Find the array in the object values
      const stationsArray = Object.values(data).find(value => Array.isArray(value)) || [];
      
      if (!Array.isArray(stationsArray)) {
        throw new Error('Invalid stations data format');
      }
      
      setStations(stationsArray);
      
      // Initialize and populate the trie
      const stationTrie = new StationTrie();
      stationsArray.forEach(station => {
        if (station && station.name) {
          stationTrie.insert(station.name.toLowerCase(), station);
          if (station.code) {
            stationTrie.insert(station.code.toLowerCase(), station);
          }
        }
      });
      
      setTrie(stationTrie);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stations:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchStations();
  }, []);

  // Function to search for stations by prefix
  const searchStations = (prefix) => {
    if (!trie || !prefix || prefix.trim() === '') {
      return [];
    }
    return trie.search(prefix.toLowerCase());
  };

  return { 
    trie, 
    stations, 
    loading, 
    error, 
    refresh: fetchStations,
    searchStations 
  };
};
