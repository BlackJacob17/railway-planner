import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for implementing infinite scroll functionality
 * @param {Object} options - Configuration options
 * @param {Function} options.fetchMore - Function to fetch more items
 * @param {boolean} [options.hasMore=true] - Whether there are more items to load
 * @param {number} [options.threshold=100] - Distance from bottom of container to trigger fetch (in pixels)
 * @param {number} [options.initialPage=1] - Initial page number
 * @param {number} [options.initialItems=[]] - Initial items array
 * @param {boolean} [options.autoLoad=true] - Whether to automatically load more when scrolling
 * @param {React.RefObject} [options.scrollContainer] - Custom scroll container ref (defaults to window)
 * @returns {Object} Infinite scroll state and methods
 */
const useInfiniteScroll = ({
  fetchMore,
  hasMore = true,
  threshold = 100,
  initialPage = 1,
  initialItems = [],
  autoLoad = true,
  scrollContainer,
} = {}) => {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const observer = useRef(null);
  const loadingRef = useRef(false);
  const lastItemRef = useRef(null);
  const containerRef = useRef(null);

  // Set the container ref (either from props or use the default window)
  const effectiveContainerRef = scrollContainer || containerRef;

  // Load more items
  const loadMore = useCallback(async () => {
    if (isLoading || loadingRef.current || !hasMore) return;

    try {
      loadingRef.current = true;
      setIsLoading(true);
      setError(null);

      const result = await fetchMore(page);
      
      if (result && !result.canceled) {
        setItems(prevItems => [...prevItems, ...(result.items || [])]);
        setPage(prevPage => prevPage + 1);
      }
    } catch (err) {
      console.error('Error loading more items:', err);
      setError(err);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [fetchMore, hasMore, isLoading, page]);

  // Reset the infinite scroll state
  const reset = useCallback(() => {
    setItems(initialItems);
    setPage(initialPage);
    setIsLoading(false);
    setError(null);
    loadingRef.current = false;
    setHasInitialized(false);
  }, [initialItems, initialPage]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!autoLoad || !hasMore || !hasInitialized) return;

    const observerOptions = {
      root: effectiveContainerRef.current === window ? null : effectiveContainerRef.current,
      rootMargin: `0px 0px ${threshold}px 0px`,
      threshold: 0,
    };

    const handleIntersect = (entries) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoading && !loadingRef.current) {
        loadMore();
      }
    };

    observer.current = new IntersectionObserver(handleIntersect, observerOptions);

    if (lastItemRef.current) {
      observer.current.observe(lastItemRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [autoLoad, hasMore, hasInitialized, isLoading, loadMore, threshold, effectiveContainerRef]);

  // Handle scroll events (fallback for browsers without IntersectionObserver)
  const handleScroll = useCallback(() => {
    if (!autoLoad || !hasMore || !hasInitialized || isLoading || loadingRef.current) return;

    const container = effectiveContainerRef.current === window 
      ? document.documentElement 
      : effectiveContainerRef.current;
    
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container === window.document.documentElement 
      ? {
          scrollTop: window.pageYOffset || document.documentElement.scrollTop,
          scrollHeight: document.documentElement.scrollHeight,
          clientHeight: window.innerHeight,
        }
      : container;

    const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

    if (isNearBottom) {
      loadMore();
    }
  }, [autoLoad, hasMore, hasInitialized, isLoading, loadMore, threshold, effectiveContainerRef]);

  // Set up scroll event listener for browsers without IntersectionObserver
  useEffect(() => {
    if (!autoLoad || !hasMore || !hasInitialized) return;
    if (typeof IntersectionObserver === 'undefined') {
      const container = effectiveContainerRef.current === window 
        ? window 
        : effectiveContainerRef.current;
      
      if (container) {
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
      }
    }
  }, [autoLoad, hasMore, hasInitialized, handleScroll, effectiveContainerRef]);

  // Initialize the infinite scroll
  useEffect(() => {
    const initialize = async () => {
      if (!hasInitialized && autoLoad && items.length === 0) {
        await loadMore();
        setHasInitialized(true);
      } else if (items.length > 0) {
        setHasInitialized(true);
      }
    };

    initialize();
  }, [autoLoad, hasInitialized, items.length, loadMore]);

  // Get props for the last item in the list (for intersection observer)
  const getLastItemProps = useCallback(() => ({
    ref: (node) => {
      if (node) {
        lastItemRef.current = node;
      }
    },
  }), []);

  // Get props for the scroll container
  const getContainerProps = useCallback(() => ({
    ref: effectiveContainerRef,
    style: {
      overflowY: 'auto',
      height: '100%',
      position: 'relative',
    },
  }), [effectiveContainerRef]);

  return {
    // State
    items,
    page,
    isLoading,
    error,
    hasMore,
    hasInitialized,
    
    // Methods
    loadMore,
    reset,
    setItems,
    setPage,
    
    // Refs and props
    lastItemRef,
    containerRef: effectiveContainerRef,
    getLastItemProps,
    getContainerProps,
  };
};

export default useInfiniteScroll;
