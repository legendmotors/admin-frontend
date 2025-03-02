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

/* List Blog Posts */
export const listBlogPosts = async (params: Record<string, any>) => {
  try {
    const response = await api.get(Apis.GetBlogPostList, { params });
    if (!response || !response.data.success || !response.data.data?.length) {
      showNotification('No blog posts found.', 'error');
      return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching blog posts:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'An error occurred while fetching blog posts.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
  }
};

/* Get Blog Post by ID */
export const getBlogPostById = async (id: number, lang: string = 'en') => {
  try {
    const response = await api.get(Apis.GetBlogPostById, { params: { id, lang } });
    if (!response || !response.data.success) {
      showNotification('Blog post not found.', 'error');
      return null;
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching blog post by ID:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error fetching blog post.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Add Blog Post */
export const addBlogPost = async (payload: Record<string, any>) => {
  try {
    const response = await api.post(Apis.AddBlogPost, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to add blog post.', 'error');
      return null;
    }
    showNotification('Blog post added successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error adding blog post:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'An error occurred while adding blog post.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Update Blog Post */
export const updateBlogPost = async (payload: Record<string, any>) => {
  try {
    const response = await api.put(Apis.UpdateBlogPost, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to update blog post.', 'error');
      return null;
    }
    showNotification('Blog post updated successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating blog post:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'An error occurred while updating blog post.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Delete Blog Post */
export const deleteBlogPost = async (id: number) => {
  try {
    const response = await api.delete(Apis.DeleteBlogPost, { params: { id } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete blog post.', 'error');
      return false;
    }
    showNotification('Blog post deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting blog post:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'An error occurred while deleting blog post.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};

/* Bulk Delete Blog Posts */
export const bulkDeleteBlogPosts = async (ids: number[]) => {
  try {
    const response = await api.delete(Apis.BulkDeleteBlogPosts, { data: { ids } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete blog posts.', 'error');
      return false;
    }
    showNotification('Blog posts deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error bulk deleting blog posts:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'An error occurred while deleting blog posts.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};
export default {
  listBlogPosts,
  getBlogPostById,
  addBlogPost,
  updateBlogPost,
  deleteBlogPost,
  bulkDeleteBlogPosts,
};
