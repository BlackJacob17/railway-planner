import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useMemo } from 'react';

/**
 * Custom hook for handling responsive design and breakpoints
 * @returns {Object} Responsive utilities and breakpoint information
 */
const useResponsive = () => {
  const theme = useTheme();
  
  // Check if the screen size matches different breakpoints
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));
  
  // Check if the screen is at least a certain size
  const isUpXs = useMediaQuery(theme.breakpoints.up('xs'));
  const isUpSm = useMediaQuery(theme.breakpoints.up('sm'));
  const isUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const isUpLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isUpXl = useMediaQuery(theme.breakpoints.up('xl'));
  
  // Check if the screen is at most a certain size
  const isDownXs = useMediaQuery(theme.breakpoints.down('xs'));
  const isDownSm = useMediaQuery(theme.breakpoints.down('sm'));
  const isDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const isDownLg = useMediaQuery(theme.breakpoints.down('lg'));
  const isDownXl = useMediaQuery(theme.breakpoints.down('xl'));
  
  // Get the current breakpoint name
  const currentBreakpoint = useMemo(() => {
    if (isXl) return 'xl';
    if (isLg) return 'lg';
    if (isMd) return 'md';
    if (isSm) return 'sm';
    return 'xs';
  }, [isXs, isSm, isMd, isLg, isXl]);
  
  // Check if the current screen is mobile (xs or sm)
  const isMobile = useMemo(() => isDownSm, [isDownSm]);
  
  // Check if the current screen is tablet (md)
  const isTablet = useMemo(() => isMd, [isMd]);
  
  // Check if the current screen is desktop (lg or xl)
  const isDesktop = useMemo(() => isUpLg, [isUpLg]);
  
  // Check if the current screen is a small device (xs)
  const isSmallDevice = useMemo(() => isXs, [isXs]);
  
  // Check if the current screen is a large device (lg or xl)
  const isLargeDevice = useMemo(() => isUpLg, [isUpLg]);
  
  // Get the current breakpoint width in pixels
  const getBreakpointWidth = useCallback((breakpoint) => {
    return theme.breakpoints.values[breakpoint] || 0;
  }, [theme.breakpoints.values]);
  
  // Get the current screen width based on breakpoints
  const screenWidth = useMemo(() => {
    return getBreakpointWidth(currentBreakpoint);
  }, [currentBreakpoint, getBreakpointWidth]);
  
  // Check if the current screen matches a custom media query
  const matchesMediaQuery = useCallback((query) => {
    return useMediaQuery(query);
  }, []);
  
  // Get responsive styles based on breakpoints
  const responsive = useMemo(() => ({
    // Spacing
    spacing: (value) => theme.spacing(value),
    
    // Typography
    responsiveFontSizes: (sizes) => {
      if (typeof sizes === 'number') return sizes;
      
      // Return the appropriate size based on breakpoint
      if (isXs && sizes.xs) return sizes.xs;
      if (isSm && sizes.sm) return sizes.sm;
      if (isMd && sizes.md) return sizes.md;
      if (isLg && sizes.lg) return sizes.lg;
      if (isXl && sizes.xl) return sizes.xl;
      
      // Fallback to default or first available size
      return sizes.default || Object.values(sizes)[0] || 16;
    },
    
    // Show/hide components based on breakpoints
    show: {
      xs: isXs,
      sm: isSm,
      md: isMd,
      lg: isLg,
      xl: isXl,
      mobile: isMobile,
      tablet: isTablet,
      desktop: isDesktop,
      smallDevice: isSmallDevice,
      largeDevice: isLargeDevice,
    },
    
    // Hide components based on breakpoints
    hide: {
      xs: !isXs,
      sm: !isSm,
      md: !isMd,
      lg: !isLg,
      xl: !isXl,
      mobile: !isMobile,
      tablet: !isTablet,
      desktop: !isDesktop,
      smallDevice: !isSmallDevice,
      largeDevice: !isLargeDevice,
    },
    
    // Media query helpers
    up: (breakpoint) => {
      return useMediaQuery(theme.breakpoints.up(breakpoint));
    },
    
    down: (breakpoint) => {
      return useMediaQuery(theme.breakpoints.down(breakpoint));
    },
    
    between: (start, end) => {
      return useMediaQuery(theme.breakpoints.between(start, end));
    },
    
    only: (breakpoint) => {
      return useMediaQuery(theme.breakpoints.only(breakpoint));
    },
  }), [
    theme, 
    isXs, isSm, isMd, isLg, isXl,
    isUpXs, isUpSm, isUpMd, isUpLg, isUpXl,
    isDownXs, isDownSm, isDownMd, isDownLg, isDownXl,
    isMobile, isTablet, isDesktop, isSmallDevice, isLargeDevice,
    currentBreakpoint,
  ]);
  
  return {
    // Breakpoint flags
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Up breakpoint flags
    isUpXs,
    isUpSm,
    isUpMd,
    isUpLg,
    isUpXl,
    
    // Down breakpoint flags
    isDownXs,
    isDownSm,
    isDownMd,
    isDownLg,
    isDownXl,
    
    // Device type flags
    isMobile,
    isTablet,
    isDesktop,
    isSmallDevice,
    isLargeDevice,
    
    // Current breakpoint info
    currentBreakpoint,
    screenWidth,
    
    // Utility functions
    getBreakpointWidth,
    matchesMediaQuery,
    
    // Responsive utilities
    responsive,
    
    // Alias for responsive
    r: responsive,
  };
};

export default useResponsive;
