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

/* List Blog Tags */
export const listBlogTags = async (params: Record<string, any>) => {
  try {
    const response = await api.get(Apis.GetBlogTagList, { params });
    if (!response || !response.data.success || !response.data.data?.length) {
      showNotification('No tags found.', 'error');
      return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching tags:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error fetching tags.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
  }
};

/* Get Blog Tag by ID */
export const getBlogTagById = async (id: number, lang: string = 'en') => {
  try {
    const response = await api.get(Apis.GetBlogTagById, { params: { id, lang } });
    if (!response || !response.data.success) {
      showNotification('Tag not found.', 'error');
      return null;
    }
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching tag by ID:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error fetching tag.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Add Blog Tag */
export const addBlogTag = async (payload: Record<string, any>) => {
  try {
    const response = await api.post(Apis.AddBlogTag, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to add tag.', 'error');
      return null;
    }
    showNotification('Tag added successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error adding tag:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error adding tag.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Update Blog Tag */
export const updateBlogTag = async (payload: Record<string, any>) => {
  try {
    const response = await api.put(Apis.UpdateBlogTag, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to update tag.', 'error');
      return null;
    }
    showNotification('Tag updated successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating tag:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error updating tag.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Delete Blog Tag */
export const deleteBlogTag = async (id: number) => {
  try {
    const response = await api.delete(Apis.DeleteBlogTag, { params: { id } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete tag.', 'error');
      return false;
    }
    showNotification('Tag deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting tag:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error deleting tag.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};

/* Bulk Delete Blog Tags */
export const bulkDeleteBlogTags = async (ids: number[]) => {
  try {
    const response = await api.delete(Apis.BulkDeleteBlogTags, { data: { ids } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete tags.', 'error');
      return false;
    }
    showNotification('Tags deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error bulk deleting tags:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error deleting tags.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};
export default {
  listBlogTags,
  getBlogTagById,
  addBlogTag,
  updateBlogTag,
  deleteBlogTag,
  bulkDeleteBlogTags,
};
