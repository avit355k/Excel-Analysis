import axios from 'axios';
const API_URL = 'http://localhost:5000/api/file/upload';

// Create axios instance with auth header
const api = axios.create({
    baseURL: API_URL,
});
// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Upload Excel file with auto-analysis
const uploadExcelFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        console.log('Uploading file:', file.name, 'Size:', file.size);

        const response = await api.post('/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000, // 60 second timeout for large files
        });

        console.log('Upload response:', response);
        return response.data;
    } catch (error) {
        console.error('Upload service error:', error);

        if (error.code === 'ECONNABORTED') {
            throw new Error('Upload timeout - file may be too large or connection too slow');
        }

        if (error.response) {
            // Server responded with error status
            throw error; // Let the component handle the response
        } else if (error.request) {
            // Network error
            throw new Error('Network error - please check your connection and try again');
        } else {
            // Other error
            throw new Error('An unexpected error occurred during upload');
        }
    }
};

// Get user's uploads with analysis status
const getUserUploads = async () => {
    const response = await api.get('/');
    return response.data.data; // Return the nested data array
};

// Get specific upload by ID with full data
const getUploadById = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.data; // Return the nested data object
};

// Delete upload and all associated data
const deleteUpload = async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
};

// Retry analysis for failed uploads
const retryAnalysis = async (id) => {
    const response = await api.post(`/${id}/analyze`);
    return response.data;
};

// Export as object
export const uploadService = {
    uploadExcelFile,
    getUserUploads,
    getUploadById,
    deleteUpload,
    retryAnalysis
};

// Keep individual exports for backward compatibility
export { uploadExcelFile, getUserUploads, getUploadById, deleteUpload, retryAnalysis };