import Swal from 'sweetalert2';
import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';
import axios, { AxiosError } from 'axios';

const showNotification = (message: string = '', icon: 'success' | 'error' = 'success'): void => {
  Swal.fire({
    title: message || (icon === 'error' ? 'Error' : 'Success'),
    icon,
    timer: 3000,
  });
};

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage?: number;
  pageSize?: number;
}

interface ListResponse<T> {
  data: T[];
  pagination: Pagination;
  success: boolean;
  message?: string;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/* List Partner Logos */
export const listPartnerLogos = async (
  params: Record<string, any>
): Promise<ListResponse<any>> => {
  try {
    const response = await api.get<ListResponse<any>>(Apis.GetPartnerLogoList, { params });
    if (!response || !response.data.success || !response.data.data?.length) {
      showNotification('No partner logos found.', 'error');
      return { data: [], pagination: { totalItems: 0, totalPages: 0 }, success: false };
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching partner logos:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while fetching partner logos.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return { data: [], pagination: { totalItems: 0, totalPages: 0 }, success: false };
  }
};

/* Get Partner Logo by ID */
export const getPartnerLogoById = async (
  id: number
): Promise<ApiResponse<any> | null> => {
  try {
    const response = await api.get<ApiResponse<any>>(Apis.GetPartnerLogoById, { params: { id } });
    if (!response || !response.data.success) {
      showNotification('Partner logo not found.', 'error');
      return null;
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching partner logo by ID:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while fetching partner logo.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Get Partner Logo by Identifier */
export const getPartnerLogoByIdentifier = async (
  identifier: string
): Promise<ApiResponse<any> | null> => {
  try {
    const response = await api.get<ApiResponse<any>>(Apis.GetPartnerLogoByIdentifier, { params: { identifier } });
    if (!response || !response.data.success) {
      showNotification('Partner logo not found.', 'error');
      return null;
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching partner logo by identifier:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while fetching partner logo by identifier.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Add Partner Logo */
export const addPartnerLogo = async (
  payload: Record<string, any>
): Promise<ApiResponse<any> | null> => {
  try {
    const response = await api.post<ApiResponse<any>>(Apis.AddPartnerLogo, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to add partner logo.', 'error');
      return null;
    }
    showNotification('Partner logo added successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error adding partner logo:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while adding partner logo.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Update Partner Logo */
export const updatePartnerLogo = async (
  payload: Record<string, any>
): Promise<ApiResponse<any> | null> => {
  try {
    const response = await api.put<ApiResponse<any>>(Apis.UpdatePartnerLogo, payload);
    if (!response || !response.data.success) {
      showNotification('Failed to update partner logo.', 'error');
      return null;
    }
    showNotification('Partner logo updated successfully!');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating partner logo:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while updating partner logo.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return null;
  }
};

/* Delete Partner Logo */
export const deletePartnerLogo = async (id: number): Promise<boolean> => {
  try {
    const response = await api.delete<ApiResponse<any>>(Apis.DeletePartnerLogo, { params: { id } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete partner logo.', 'error');
      return false;
    }
    showNotification('Partner logo deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting partner logo:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while deleting partner logo.',
        'error'
      );
    } else {
      console.error('Unexpected error:', error);
      showNotification('An unexpected error occurred.', 'error');
    }
    return false;
  }
};

/* Bulk Delete Partner Logos */
export const bulkDeletePartnerLogos = async (ids: number[]): Promise<boolean> => {
  try {
    const response = await api.delete<ApiResponse<any>>(Apis.BulkDeletePartnerLogos, { data: { ids } });
    if (!response || !response.data.success) {
      showNotification('Failed to delete partner logos.', 'error');
      return false;
    }
    showNotification('Partner logos deleted successfully!');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error bulk deleting partner logos:', error.response?.data?.message);
      showNotification(
        error.response?.data?.message || 'An error occurred while deleting partner logos.',
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
  listPartnerLogos,
  getPartnerLogoById,
  getPartnerLogoByIdentifier,
  addPartnerLogo,
  updatePartnerLogo,
  deletePartnerLogo,
  bulkDeletePartnerLogos,
};
