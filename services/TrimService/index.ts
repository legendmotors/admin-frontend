import Swal from 'sweetalert2';

import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';



// Show notification
const showTopCenterNotification = (message: string) => {
    Swal.fire({
        title: message,
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
    });
};

/* List Trims */
const listTrim = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetTrimList, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No trims found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching trims:', error);
        showTopCenterNotification('An error occurred while fetching trims.');
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

/* Add Trim */
const addTrim = async (payload: Record<string, any>) => {
    try {
        const response = await api.post(Apis.AddTrim, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to add trim.');
            return null;
        }

        showTopCenterNotification('Trim added successfully!');
        return response.data;
    } catch (error) {
        console.error('Error adding trim:', error);
        showTopCenterNotification('An error occurred while adding the trim.');
        return null;
    }
};

/* Update Trim */
const updateTrim = async (payload: Record<string, any>) => {
    try {
        const response = await api.put(Apis.UpdateTrim, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update trim.');
            return null;
        }

        showTopCenterNotification('Trim updated successfully!');
        return response.data;
    } catch (error) {
        console.error('Error updating trim:', error);
        showTopCenterNotification('An error occurred while updating the trim.');
        return null;
    }
};

/* Get Trim by ID */
const getTrimById = async (id: number) => {
    try {
        const response = await api.get(Apis.GetTrimById, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Trim not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching trim by ID:', error);
        showTopCenterNotification('An error occurred while fetching the trim.');
        return null;
    }
};

/* Delete Trim */
const deleteTrim = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeleteTrim, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete trim.');
            return false;
        }

        showTopCenterNotification('Trim deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting trim:', error);
        showTopCenterNotification('An error occurred while deleting the trim.');
        return false;
    }
};

/* Bulk Delete Trims */
const bulkDeleteTrims = async (ids: number[]) => {
    try {
        const response = await api.delete(Apis.BulkDeleteTrims, { data: { ids } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete trims.');
            return false;
        }

        showTopCenterNotification('Trims deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting trims:', error);
        showTopCenterNotification('An error occurred while deleting trims.');
        return false;
    }
};

export default {
    listTrim,
    addTrim,
    updateTrim,
    getTrimById,
    deleteTrim,
    bulkDeleteTrims,
};
