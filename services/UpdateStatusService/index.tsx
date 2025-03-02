import Swal from 'sweetalert2';

import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';
import axios from 'axios';



// Notification helper
const showTopCenterNotification = (message: string = '') => {
    Swal.fire({
        title: message || 'Error',
        icon: 'success',
        timer: 3000,
    });
};

// Update status for a single item
const updateStatus = async (payload: { model: string; id: number; status: 'draft' | 'published' }) => {
    try {
        const response = await api.post(Apis.UpdateStatus, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update status.');
            return null;
        }

        showTopCenterNotification(`${payload.model} status updated successfully!`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error updating status:`, error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while updating status.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return null;
    }
};

// Bulk update status for multiple items
const bulkUpdateStatus = async (payload: { model: string; ids: number[]; status: 'draft' | 'published' }) => {
    try {
        const response = await api.post(Apis.BulkUpdateStatus, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to bulk update status.');
            return false;
        }

        showTopCenterNotification(`Statuses updated successfully for ${payload.model}!`);
        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error bulk updating statuses:`, error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while bulk updating statuses.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return false;
    }
};

// Retrieve items by status
const getItemsByStatus = async (params: { model: string; status: 'draft' | 'published' }) => {
    try {
        const response = await api.get(Apis.GetItemsByStatus, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No items found.');
            return [];
        }

        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error retrieving items by status:`, error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while retrieving items.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return [];
    }
};

// Retrieve status by ID
const getStatusById = async (params: { model: string; id: number }) => {
    try {
        const response = await api.get(Apis.GetStatusById, { params });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Item not found.');
            return null;
        }

        return response.data.status;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error retrieving status by ID:`, error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while retrieving the status.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return null;
    }
};

export default {
    updateStatus,
    bulkUpdateStatus,
    getItemsByStatus,
    getStatusById,
};
