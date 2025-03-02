import Swal from 'sweetalert2';

import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';
import axios from 'axios';



// Show notification
const showTopCenterNotification = (message: string = '') => {
    Swal.fire({
        title: message || 'Error',
        icon: 'success',
        timer: 3000,
        // position: 'top',
    });
};

/* List Brands */
const listBrand = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetBrandList, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No brands found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching brands:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while fetching brands.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }

        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

/* Get Brand by ID */
const getBrandById = async (id: number) => {
    try {
        const response = await api.get(Apis.GetBrandById, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Brand not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching brand by ID:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while fetching the brand.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return null;
    }
};

/* Add Brand */
const addBrand = async (payload: Record<string, any>) => {
    try {
        const response = await api.post(Apis.AddBrand, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to add brand.');
            return null;
        }

        showTopCenterNotification('Brand added successfully!');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error adding brand:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while adding the brand.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return null;
    }
};

/* Update Brand */
const updateBrand = async (payload: Record<string, any>) => {
    try {
        const response = await api.put(Apis.UpdateBrand, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update brand.');
            return null;
        }

        showTopCenterNotification('Brand updated successfully!');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error updating brand:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while updating the brand.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return null;
    }
};

/* Delete Brand */
const deleteBrand = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeleteBrand, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete brand.');
            return false;
        }
        showTopCenterNotification('Brand deleted successfully!');
        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error deleting brand:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while deleting the brand.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return false;
    }
};

/* Bulk Delete Brands */
const bulkDeleteBrands = async (ids: number[]) => {
    try {
        const response = await api.delete(Apis.BulkDeleteBrands, { data: { ids } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete brands.');
            return false;
        }

        showTopCenterNotification('Brands deleted successfully!');
        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error deleting brands:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while deleting brands.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return false;
    }
};

export default {
    listBrand,
    getBrandById,
    addBrand,
    updateBrand,
    deleteBrand,
    bulkDeleteBrands,
};
