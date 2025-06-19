import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';

/**
 * Custom hook for handling pagination state and URL synchronization
 * @param {Object} options - Pagination options
 * @param {number} [options.initialPage=1] - Initial page number
 * @param {number} [options.initialPageSize=10] - Initial number of items per page
 * @param {string} [options.pageParam='page'] - URL query parameter name for page
 * @param {string} [options.pageSizeParam='pageSize'] - URL query parameter name for page size
 * @param {boolean} [options.syncWithUrl=true] - Whether to sync pagination state with URL
 * @returns {Object} Pagination state and methods
 */
const usePagination = (options = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageParam = 'page',
    pageSizeParam = 'pageSize',
    syncWithUrl = true,
  } = options;

  const location = useLocation();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 1,
  });

  // Initialize pagination from URL if syncWithUrl is true
  useEffect(() => {
    if (!syncWithUrl) return;

    const queryParams = queryString.parse(location.search);
    const page = parseInt(queryParams[pageParam], 10) || initialPage;
    const pageSize = parseInt(queryParams[pageSizeParam], 10) || initialPageSize;

    setPagination(prev => ({
      ...prev,
      page,
      pageSize,
    }));
  }, [location.search, pageParam, pageSizeParam, initialPage, initialPageSize, syncWithUrl]);

  // Update URL when pagination changes
  const updateUrl = useCallback(
    (newPagination) => {
      if (!syncWithUrl) return;

      const queryParams = queryString.parse(location.search);
      
      // Only update the params that changed
      if (newPagination.page !== undefined) {
        queryParams[pageParam] = newPagination.page > 1 ? newPagination.page.toString() : undefined;
      }
      
      if (newPagination.pageSize !== undefined) {
        queryParams[pageSizeParam] = 
          newPagination.pageSize !== initialPageSize 
            ? newPagination.pageSize.toString() 
            : undefined;
      }

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      // Update URL without triggering a page reload
      const newSearch = queryString.stringify(queryParams);
      if (newSearch !== location.search.replace(/^\?/, '')) {
        navigate(
          {
            pathname: location.pathname,
            search: newSearch ? `?${newSearch}` : '',
          },
          { replace: true }
        );
      }
    },
    [location.pathname, location.search, navigate, pageParam, pageSizeParam, initialPageSize, syncWithUrl]
  );

  /**
   * Change the current page
   * @param {number} page - The page number to navigate to
   * @param {boolean} [updateUrl=true] - Whether to update the URL
   */
  const setPage = useCallback(
    (page, shouldUpdateUrl = true) => {
      setPagination(prev => {
        const newPage = Math.max(1, Math.min(page, prev.totalPages || 1));
        const newPagination = {
          ...prev,
          page: newPage,
        };
        
        if (shouldUpdateUrl) {
          updateUrl(newPagination);
        }
        
        return newPagination;
      });
    },
    [updateUrl]
  );

  /**
   * Change the number of items per page
   * @param {number} pageSize - The number of items per page
   * @param {boolean} [resetToFirstPage=true] - Whether to reset to the first page
   */
  const setPageSize = useCallback(
    (pageSize, resetToFirstPage = true) => {
      setPagination(prev => {
        const newPageSize = Math.max(1, pageSize);
        const newPage = resetToFirstPage ? 1 : Math.min(prev.page, Math.ceil(prev.total / newPageSize) || 1);
        
        const newPagination = {
          ...prev,
          pageSize: newPageSize,
          page: newPage,
          totalPages: Math.ceil(prev.total / newPageSize) || 1,
        };
        
        updateUrl({
          page: newPage,
          pageSize: newPageSize,
        });
        
        return newPagination;
      });
    },
    [updateUrl]
  );

  /**
   * Update the total number of items and recalculate total pages
   * @param {number} total - Total number of items
   */
  const setTotal = useCallback((total) => {
    setPagination(prev => ({
      ...prev,
      total,
      totalPages: Math.ceil(total / prev.pageSize) || 1,
    }));
  }, []);

  /**
   * Reset pagination to initial state
   */
  const resetPagination = useCallback(() => {
    setPagination({
      page: initialPage,
      pageSize: initialPageSize,
      total: 0,
      totalPages: 1,
    });
    
    if (syncWithUrl) {
      updateUrl({
        page: initialPage,
        pageSize: initialPageSize,
      });
    }
  }, [initialPage, initialPageSize, syncWithUrl, updateUrl]);

  /**
   * Get the current offset for API requests (useful for skip/limit)
   * @returns {number} The offset value
   */
  const getOffset = useCallback(() => {
    return (pagination.page - 1) * pagination.pageSize;
  }, [pagination.page, pagination.pageSize]);

  /**
   * Get pagination parameters for API requests
   * @returns {Object} Object with pagination parameters
   */
  const getPaginationParams = useCallback(() => {
    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      offset: getOffset(),
      limit: pagination.pageSize,
    };
  }, [pagination.page, pagination.pageSize, getOffset]);

  return {
    // State
    ...pagination,
    
    // Derived state
    hasNextPage: pagination.page < pagination.totalPages,
    hasPreviousPage: pagination.page > 1,
    isFirstPage: pagination.page === 1,
    isLastPage: pagination.page >= pagination.totalPages,
    
    // Methods
    setPage,
    setPageSize,
    setTotal,
    nextPage: () => setPage(pagination.page + 1),
    previousPage: () => setPage(pagination.page - 1),
    firstPage: () => setPage(1),
    lastPage: () => setPage(pagination.totalPages),
    resetPagination,
    getOffset,
    getPaginationParams,
    
    // For table components that expect these props
    onPageChange: (_, page) => setPage(page + 1), // MUI TablePagination uses 0-based index
    onRowsPerPageChange: (event) => setPageSize(parseInt(event.target.value, 10)),
    rowsPerPage: pagination.pageSize,
    rowsPerPageOptions: [5, 10, 25, 50],
    count: pagination.total,
    page: pagination.page - 1, // For MUI components that expect 0-based index
  };
};

export default usePagination;
