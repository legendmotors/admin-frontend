import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';
import Swal from 'sweetalert2';




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

/* List Year */
const listYear = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetYearList, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No years found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching years:', error);
        showTopCenterNotification('An error occurred while fetching years.');
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

/* Add Year */
const addYear = async (payload: Record<string, any>) => {
    try {
        const response = await api.post(Apis.AddYear, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to add year.');
            return null;
        }

        showTopCenterNotification('Year added successfully!');
        return response.data;
    } catch (error) {
        console.error('Error adding year:', error);
        showTopCenterNotification('An error occurred while adding the year.');
        return null;
    }
};

/* Update Year */
const updateYear = async (payload: Record<string, any>) => {
    try {
        const response = await api.put(Apis.UpdateYear, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update year.');
            return null;
        }

        showTopCenterNotification('Year updated successfully!');
        return response.data;
    } catch (error) {
        console.error('Error updating year:', error);
        showTopCenterNotification('An error occurred while updating the year.');
        return null;
    }
};

/* Get Year by ID */
const getYearById = async (id: number) => {
    try {
        const response = await api.get(Apis.GetYearById, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Year not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching year by ID:', error);
        showTopCenterNotification('An error occurred while fetching the year.');
        return null;
    }
};

/* Delete Year */
const deleteYear = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeleteYear, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete year.');
            return false;
        }

        showTopCenterNotification('Year deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting year:', error);
        showTopCenterNotification('An error occurred while deleting the year.');
        return false;
    }
};

/* Bulk Delete Years */
const bulkDeleteYears = async (ids: number[]) => {
    try {
        const response = await api.delete(Apis.BulkDeleteYears, { data: { ids } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete years.');
            return false;
        }

        showTopCenterNotification('Years deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting years:', error);
        showTopCenterNotification('An error occurred while deleting years.');
        return false;
    }
};

export default {
    listYear,
    addYear,
    updateYear,
    getYearById,
    deleteYear,
    bulkDeleteYears,
};
