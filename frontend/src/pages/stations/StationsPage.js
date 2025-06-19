import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useStationTrie } from '../../hooks/useStationTrie';
import {
  Container,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  InputAdornment,
  Chip,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrainIcon from '@mui/icons-material/Train';
import { styled } from '@mui/material/styles';


const PageContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export default function StationsPage() {
  const { 
    stations = [], 
    loading, 
    error, 
    refresh,
    searchStations 
  } = useStationTrie();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        const results = searchStations(searchTerm, { limit: 10 });
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchStations]);

  // Show all stations if search is empty, else show suggestions
  const filteredStations = useMemo(() => {
    if (!searchTerm.trim()) return stations;
    return suggestions.map(s => s.data);
  }, [stations, suggestions, searchTerm]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
    setSearchFocused(false);
  };

  return (
    <PageContainer maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography component="h1" variant="h4">
          All Stations
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh stations"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      
      <Box position="relative">
        <SearchBar
          fullWidth
          variant="outlined"
          placeholder="Search by station name or code..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <Box 
                  component="button"
                  onClick={() => setSearchTerm('')}
                  sx={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 0.5,
                    borderRadius: '50%',
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: '2px'
                    }
                  }}
                  aria-label="Clear search"
                >
                  ✕
                </Box>
              </InputAdornment>
            ),
          }}
          aria-label="Search stations"
        />

        {/* Autocomplete Dropdown */}
        {searchFocused && searchTerm && suggestions.length > 0 && (
          <Box 
            sx={{
              position: 'absolute',
              width: '100%',
              bgcolor: 'background.paper',
              boxShadow: 3,
              borderRadius: 1,
              maxHeight: 300,
              overflowY: 'auto',
              zIndex: 10,
              mt: 0.5,
              border: '1px solid',
              borderColor: 'divider',
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent input blur on click
          >
            {suggestions.map((suggestion) => (
              <Box
                key={`${suggestion.data._id || suggestion.data.id || suggestion.name}-${suggestion.name}`}
                sx={{
                  px: 2,
                  py: 1.5,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover, &:focus-visible': { 
                    bgcolor: 'action.hover',
                    outline: 'none'
                  },
                  '&:not(:last-child)': {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  },
                }}
                onClick={() => handleSuggestionClick(suggestion)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSuggestionClick(suggestion);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Select ${suggestion.name} station`}
              >
                <Box>
                  <Typography variant="body1">{suggestion.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {suggestion.data.code && `Code: ${suggestion.data.code} • `}
                    {suggestion.data.location || ''}
                  </Typography>
                </Box>
                {suggestion.data.code && (
                  <Chip 
                    label={suggestion.data.code} 
                    size="small" 
                    variant="outlined"
                    sx={{ ml: 1, flexShrink: 0 }}
                  />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>


      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error.message || error.toString()}</Alert>}
      {!loading && !error && (
        <Grid container spacing={3}>
          {filteredStations.length > 0 ? (
            filteredStations.map((station) => (
              <Grid item key={station._id} xs={12} sm={6} md={4} lg={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardActionArea 
                    component={RouterLink} 
                    to={`/stations/${station._id}`}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      p: 2,
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" width="100%" mb={1}>
                      <Typography variant="h6" component="h2" noWrap>
                        {station.name}
                      </Typography>
                      {station.code && (
                        <Chip 
                          label={station.code} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                          sx={{ ml: 1, flexShrink: 0 }}
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 'auto', width: '100%' }}>
                      {station.location && (
                        <Box display="flex" alignItems="center" mb={1}>
                          <LocationOnIcon color="action" fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {station.location}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Box display="flex" alignItems="center">
                          <TrainIcon color="action" fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {station.platforms || 'N/A'} Platforms
                          </Typography>
                        </Box>
                        
                        <Chip 
                          label={station.isActive ? 'Active' : 'Inactive'} 
                          size="small" 
                          color={station.isActive ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert 
                severity="info" 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  '& .MuiAlert-message': {
                    flex: 1,
                  },
                }}
              >
                <Box>
                  <Typography>No stations found matching your search.</Typography>
                  <Typography variant="body2" mt={1}>
                    Try a different search term or check back later.
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={refresh}
                  disabled={loading}
                  sx={{ ml: 2 }}
                >
                  Refresh
                </Button>
              </Alert>
            </Grid>
          )}
        </Grid>
      )}
    </PageContainer>
  );
}

