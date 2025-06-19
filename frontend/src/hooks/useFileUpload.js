import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for handling file uploads with progress tracking
 * @param {Object} options - Configuration options
 * @param {string} options.url - The upload endpoint URL
 * @param {Object} [options.headers] - Additional headers to include in the request
 * @param {string} [options.fieldName='file'] - The form field name for the file
 * @param {Function} [options.onProgress] - Callback for upload progress
 * @param {Function} [options.onSuccess] - Callback for successful upload
 * @param {Function} [options.onError] - Callback for upload error
 * @param {Function} [options.onCancel] - Callback when upload is canceled
 * @param {number} [options.maxFileSize=10 * 1024 * 1024] - Maximum file size in bytes (default: 10MB)
 * @param {string[]} [options.allowedFileTypes] - Allowed file MIME types
 * @returns {Object} File upload state and methods
 */
const useFileUpload = (options = {}) => {
  const {
    url,
    headers = {},
    fieldName = 'file',
    onProgress,
    onSuccess,
    onError,
    onCancel,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  } = options;

  const [state, setState] = useState({
    file: null,
    fileName: '',
    fileSize: 0,
    fileType: '',
    isUploading: false,
    progress: 0,
    uploadComplete: false,
    error: null,
    response: null,
  });

  const cancelTokenSource = useRef(null);
  const uploadController = useRef(null);

  // Validate file before upload
  const validateFile = useCallback((file) => {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2);
      return { 
        valid: false, 
        error: `File is too large. Maximum size is ${maxSizeMB}MB` 
      };
    }

    // Check file type
    if (allowedFileTypes.length > 0 && !allowedFileTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}` 
      };
    }

    return { valid: true };
  }, [maxFileSize, allowedFileTypes]);

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setState(prev => ({
        ...prev,
        error: validation.error,
        file: null,
        fileName: '',
        fileSize: 0,
        fileType: '',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      error: null,
      uploadComplete: false,
      progress: 0,
      response: null,
    }));
  }, [validateFile]);

  // Handle drag and drop
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setState(prev => ({
        ...prev,
        error: validation.error,
        file: null,
        fileName: '',
        fileSize: 0,
        fileType: '',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      error: null,
      uploadComplete: false,
      progress: 0,
      response: null,
    }));
  }, [validateFile]);

  // Handle drag over
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // Upload file
  const uploadFile = useCallback(async (additionalData = {}) => {
    if (!state.file) {
      setState(prev => ({ ...prev, error: 'No file selected' }));
      return { success: false, error: 'No file selected' };
    }

    // Cancel any ongoing upload
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('New upload started');
    }

    // Create new cancel token and controller
    cancelTokenSource.current = axios.CancelToken.source();
    uploadController.current = new AbortController();

    const formData = new FormData();
    formData.append(fieldName, state.file);

    // Append additional data to form data
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
      uploadComplete: false,
    }));

    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          
          setState(prev => ({
            ...prev,
            progress,
          }));
          
          if (onProgress) {
            onProgress(progress, progressEvent);
          }
        },
        cancelToken: cancelTokenSource.current.token,
        signal: uploadController.current.signal,
      });

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadComplete: true,
        response: response.data,
      }));

      if (onSuccess) {
        onSuccess(response.data, state.file);
      }

      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isCancel(error)) {
        const message = error.message || 'Upload canceled';
        setState(prev => ({
          ...prev,
          isUploading: false,
          error: message,
        }));
        
        if (onCancel) {
          onCancel(message);
        }
        
        return { success: false, canceled: true, error: message };
      }

      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }));
      
      if (onError) {
        onError(error, errorMessage);
      }
      
      return { success: false, error: errorMessage };
    }
  }, [
    url,
    headers,
    fieldName,
    onProgress,
    onSuccess,
    onError,
    onCancel,
    state.file,
  ]);

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('Upload canceled by user');
    }
    
    if (uploadController.current) {
      uploadController.current.abort();
    }
    
    setState(prev => ({
      ...prev,
      isUploading: false,
      progress: 0,
    }));
  }, []);

  // Reset upload state
  const reset = useCallback(() => {
    cancelUpload();
    
    setState({
      file: null,
      fileName: '',
      fileSize: 0,
      fileType: '',
      isUploading: false,
      progress: 0,
      uploadComplete: false,
      error: null,
      response: null,
    });
  }, [cancelUpload]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel('Component unmounted');
      }
      
      if (uploadController.current) {
        uploadController.current.abort();
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Derived state
    isComplete: state.uploadComplete,
    hasError: !!state.error,
    
    // Methods
    handleFileSelect,
    handleDrop,
    handleDragOver,
    uploadFile,
    cancelUpload,
    reset,
    
    // For file input props
    getInputProps: () => ({
      type: 'file',
      onChange: handleFileSelect,
      accept: allowedFileTypes.join(','),
    }),
    
    // For dropzone props
    getRootProps: () => ({
      onDrop: handleDrop,
      onDragOver: handleDragOver,
    }),
  };
};

export default useFileUpload;
