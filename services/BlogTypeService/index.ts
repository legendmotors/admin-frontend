import Swal from 'sweetalert2';

import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';
import axios from 'axios';



const showNotification = (message: string = '', icon: 'success' | 'error' = 'success') => {
  Swal.fire({
    title: message || (icon === 'error' ? 'Error' : 'Success'),
    icon,
    timer: 3000,
  });
};

/* List Blog Types */
export const listBlogTypes = async (params: Record<string, any>) => {
  try {
    const response = await api.get(Apis.GetBlogTypeList, { params });
    if (!response || !response.data.success || !response.data.data?.length) {
      showNotification('No types found.', 'error');
      return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching types:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error fetching types.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
  }
};

/* Get Blog Type by ID */
export const getBlogTypeById = async (id: number, lang: string = 'en') => {
  try {
    const response = await api.get(Apis.GetBlogTypeById, { params: { id, lang } });
    if (!response || !response.data.success) {
      showNotification('Type not found.', 'error');
      return null;
    }
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching type by ID:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error fetching type.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Add Blog Type */
export const addBlogType = async (payload: Record<string, any>) => {
  try {
    const response = await api.post(Apis.AddBlogType, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to add type.', 'error');
      return null;
    }
    showNotification('Type added successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error adding type:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error adding type.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Update Blog Type */
export const updateBlogType = async (payload: Record<string, any>) => {
  try {
    const response = await api.put(Apis.UpdateBlogType, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to update type.', 'error');
      return null;
    }
    showNotification('Type updated successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating type:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error updating type.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Delete Blog Type */
export const deleteBlogType = async (id: number) => {
  try {
    const response = await api.delete(Apis.DeleteBlogType, { params: { id } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete type.', 'error');
      return false;
    }
    showNotification('Type deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting type:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error deleting type.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};

/* Bulk Delete Blog Types */
export const bulkDeleteBlogTypes = async (ids: number[]) => {
  try {
    const response = await api.delete(Apis.BulkDeleteBlogTypes, { data: { ids } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete types.', 'error');
      return false;
    }
    showNotification('Types deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error bulk deleting types:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error deleting types.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};
export default {
  listBlogTypes,
  getBlogTypeById,
  addBlogType,
  updateBlogType,
  deleteBlogType,
  bulkDeleteBlogTypes,
};
