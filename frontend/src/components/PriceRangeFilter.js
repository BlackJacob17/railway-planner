import React, { useState, useEffect } from 'react';
import { Slider, Typography, Box, Paper, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const PriceSlider = styled(Slider)(({ theme }) => ({
  width: '90%',
  margin: '0 auto',
  '& .MuiSlider-valueLabel': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
    padding: '4px 8px',
  },
}));

const PriceRangeFilter = ({ 
  tickets = [], 
  onPriceRangeChange,
  initialMin,
  initialMax
}) => {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [loading, setLoading] = useState(true);

  // Initialize price range when tickets or initial values change
  useEffect(() => {
    if (tickets && tickets.length > 0) {
      const prices = tickets
        .map(t => t.fare || t.price) // Handle both fare and price properties
        .filter(p => p !== undefined && p !== null);
      
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        setPriceRange([
          initialMin !== undefined && initialMin !== null ? initialMin : minPrice,
          initialMax !== undefined && initialMax !== null ? initialMax : maxPrice
        ]);
      } else {
        // Default range if no valid prices found
        setPriceRange([0, 1000]);
      }
      setLoading(false);
    } else {
      // Handle empty tickets array
      setPriceRange([0, 1000]);
      setLoading(false);
    }
  }, [tickets, initialMin, initialMax]);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleChangeCommitted = (event, newValue) => {
    if (onPriceRangeChange) {
      onPriceRangeChange({
        min: newValue[0],
        max: newValue[1]
      });
    }
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography>Loading price filter...</Typography>
      </Paper>
    );
  }

  // Calculate min and max prices safely
  const prices = (tickets || [])
    .map(t => t.fare || t.price)
    .filter(p => p !== undefined && p !== null);
    
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 1000;

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Price Range
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ px: 2 }}>
        <PriceSlider
          value={priceRange}
          onChange={handlePriceChange}
          onChangeCommitted={handleChangeCommitted}
          valueLabelDisplay="on"
          valueLabelFormat={(value) => `₹${value}`}
          min={Math.floor(minPrice)}
          max={Math.ceil(maxPrice)}
          step={10}
          disableSwap
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption">
            ₹{(priceRange[0] || 0).toLocaleString()}
          </Typography>
          <Typography variant="caption">
            ₹{(priceRange[1] || 1000).toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default PriceRangeFilter;
