import Swal from 'sweetalert2';

import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';
import axios from 'axios';



const showNotification = (
  message: string = '',
  icon: 'success' | 'error' = 'success'
) => {
  Swal.fire({
    title: message || (icon === 'error' ? 'Error' : 'Success'),
    icon,
    timer: 3000,
  });
};

/* List Pages */
export const listPages = async (params: Record<string, any>) => {
  try {
    const response = await api.get(Apis.GetPageList, { params });
    if (
      !response ||
      !response.data.success ||
      !response.data.data?.length
    ) {
      showNotification('No pages found.', 'error');
      return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching pages:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message ||
          'An error occurred while fetching pages.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
  }
};

/* Get Page by ID (with sections & translations) */
export const getPageById = async (id: number, lang: string = 'en') => {
  try {
    const response = await api.get(Apis.GetPageById, { params: { id, lang } });
    if (!response || !response.data.success) {
      showNotification('Page not found.', 'error');
      return null;
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching page by ID:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while fetching page.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Get Page by Slug (with sections & translations) */
export const getPageBySlug = async (slug: string, lang: string = 'en') => {
  try {
    const response = await api.get(Apis.GetPageBySlug, { params: { slug, lang } });
    if (!response || !response.data.success) {
      showNotification('Page not found.', 'error');
      return null;
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching page by slug:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while fetching page.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Add Page */
export const addPage = async (payload: Record<string, any>) => {
  try {
    const response = await api.post(Apis.AddPage, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to add page.', 'error');
      return null;
    }
    showNotification('Page added successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error adding page:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while adding page.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Update Page */
export const updatePage = async (payload: Record<string, any>) => {
  try {
    const response = await api.put(Apis.UpdatePage, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to update page.', 'error');
      return null;
    }
    showNotification('Page updated successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating page:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while updating page.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Delete Page */
export const deletePage = async (id: number) => {
  try {
    const response = await api.delete(Apis.DeletePage, { params: { id } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete page.', 'error');
      return false;
    }
    showNotification('Page deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting page:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while deleting page.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};

/* Bulk Delete Pages */
export const bulkDeletePages = async (ids: number[]) => {
  try {
    const response = await api.delete(Apis.BulkDeletePages, { data: { ids } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete pages.', 'error');
      return false;
    }
    showNotification('Pages deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error bulk deleting pages:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while deleting pages.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};

export default {
  listPages,
  getPageById,
  getPageBySlug,
  addPage,
  updatePage,
  deletePage,
  bulkDeletePages,
};
