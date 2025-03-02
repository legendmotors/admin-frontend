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

/* List Blog Categories */
export const listBlogCategories = async (params: Record<string, any>) => {
  try {
    const response = await api.get(Apis.GetBlogCategoryList, { params });
    if (!response || !response.data.success || !response.data.data?.length) {
      showNotification('No categories found.', 'error');
      return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching categories:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error fetching categories.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
  }
};

/* Get Blog Category by ID */
export const getBlogCategoryById = async (id: number, lang: string = 'en') => {
  try {
    const response = await api.get(Apis.GetBlogCategoryById, { params: { id, lang } });
    if (!response || !response.data.success) {
      showNotification('Category not found.', 'error');
      return null;
    }
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching category by ID:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error fetching category.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Add Blog Category */
export const addBlogCategory = async (payload: Record<string, any>) => {
  try {
    const response = await api.post(Apis.AddBlogCategory, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to add category.', 'error');
      return null;
    }
    showNotification('Category added successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error adding category:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error adding category.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Update Blog Category */
export const updateBlogCategory = async (payload: Record<string, any>) => {
  try {
    const response = await api.put(Apis.UpdateBlogCategory, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to update category.', 'error');
      return null;
    }
    showNotification('Category updated successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating category:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error updating category.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Delete Blog Category */
export const deleteBlogCategory = async (id: number) => {
  try {
    const response = await api.delete(Apis.DeleteBlogCategory, { params: { id } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete category.', 'error');
      return false;
    }
    showNotification('Category deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting category:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error deleting category.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};

/* Bulk Delete Blog Categories */
export const bulkDeleteBlogCategories = async (ids: number[]) => {
  try {
    const response = await api.delete(Apis.BulkDeleteBlogCategories, { data: { ids } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete categories.', 'error');
      return false;
    }
    showNotification('Categories deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error bulk deleting categories:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error deleting categories.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};


export default {
  listBlogCategories,
  getBlogCategoryById,
  addBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  bulkDeleteBlogCategories,
};
