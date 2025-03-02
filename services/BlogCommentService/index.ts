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

/* List Blog Comments */
export const listBlogComments = async (params: Record<string, any>) => {
  try {
    const response = await api.get(Apis.GetBlogCommentList, { params });
    if (!response || !response.data.success || !response.data.data?.length) {
      showNotification('No comments found.', 'error');
      return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching comments:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error fetching comments.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
  }
};

/* Get Blog Comment by ID */
export const getBlogCommentById = async (id: number) => {
  try {
    const response = await api.get(Apis.GetBlogCommentById, { params: { id } });
    if (!response || !response.data.success) {
      showNotification('Comment not found.', 'error');
      return null;
    }
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching comment by ID:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error fetching comment.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Add Blog Comment */
export const addBlogComment = async (payload: Record<string, any>) => {
  try {
    const response = await api.post(Apis.AddBlogComment, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to add comment.', 'error');
      return null;
    }
    showNotification('Comment added successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error adding comment:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error adding comment.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Update Blog Comment */
export const updateBlogComment = async (payload: Record<string, any>) => {
  try {
    const response = await api.put(Apis.UpdateBlogComment, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to update comment.', 'error');
      return null;
    }
    showNotification('Comment updated successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating comment:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error updating comment.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Delete Blog Comment */
export const deleteBlogComment = async (id: number) => {
  try {
    const response = await api.delete(Apis.DeleteBlogComment, { params: { id } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete comment.', 'error');
      return false;
    }
    showNotification('Comment deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting comment:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error deleting comment.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};

/* Bulk Delete Blog Comments */
export const bulkDeleteBlogComments = async (ids: number[]) => {
  try {
    const response = await api.delete(Apis.BulkDeleteBlogComments, { data: { ids } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete comments.', 'error');
      return false;
    }
    showNotification('Comments deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error bulk deleting comments:', error.response?.data?.message);
      showNotification(error.response?.data?.message || 'Error deleting comments.', 'error');
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};
export default {
  listBlogComments,
  getBlogCommentById,
  addBlogComment,
  updateBlogComment,
  deleteBlogComment,
  bulkDeleteBlogComments,
};
