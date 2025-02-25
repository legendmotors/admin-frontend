import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';
import axios from 'axios';

const MySwal = withReactContent(Swal);

const showNotification = (message: string = '', icon: 'success' | 'error' = 'success') => {
  Swal.fire({
    title: message || (icon === 'error' ? 'Error' : 'Success'),
    icon,
    timer: 3000,
  });
};

/* List Banners */
export const listBanners = async (params: Record<string, any>) => {
  try {
    const response = await api.get(Apis.GetBannerList, { params });
    if (!response || !response.data.success || !response.data.data?.length) {
      showNotification('No banners found.', 'error');
      return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching banners:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while fetching banners.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
  }
};

/* Get Banner by ID */
export const getBannerById = async (id: number) => {
  try {
    const response = await api.get(Apis.GetBannerById, { params: { id } });
    if (!response || !response.data.success) {
      showNotification('Banner not found.', 'error');
      return null;
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching banner by ID:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while fetching banner.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Get Banner by Slug */
export const getBannerBySlug = async (slug: string) => {
  try {
    const response = await api.get(Apis.GetBannerBySlug, { params: { slug } });
    if (!response || !response.data.success) {
      showNotification('Banner not found.', 'error');
      return null;
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching banner by slug:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while fetching banner by slug.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Add Banner */
export const addBanner = async (payload: Record<string, any>) => {
  try {
    const response = await api.post(Apis.AddBanner, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to add banner.', 'error');
      return null;
    }
    showNotification('Banner added successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error adding banner:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while adding banner.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Update Banner */
export const updateBanner = async (payload: Record<string, any>) => {
  try {
    const response = await api.put(Apis.UpdateBanner, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to update banner.', 'error');
      return null;
    }
    showNotification('Banner updated successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating banner:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while updating banner.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Delete Banner */
export const deleteBanner = async (id: number) => {
  try {
    const response = await api.delete(Apis.DeleteBanner, { params: { id } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete banner.', 'error');
      return false;
    }
    showNotification('Banner deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting banner:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while deleting banner.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};

/* Bulk Delete Banners */
export const bulkDeleteBanners = async (ids: number[]) => {
  try {
    const response = await api.delete(Apis.BulkDeleteBanners, { data: { ids } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete banners.', 'error');
      return false;
    }
    showNotification('Banners deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error bulk deleting banners:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while deleting banners.',
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
  listBanners,
  getBannerById,
  getBannerBySlug,
  addBanner,
  updateBanner,
  deleteBanner,
  bulkDeleteBanners,
};
