import Swal from 'sweetalert2';

import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';



// Helper function to display toast notifications
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

/* ===== Specification API Calls ===== */

/* List Specifications */
const listSpecifications = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetSpecificationList, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No specifications found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching specifications:', error);
        showTopCenterNotification('An error occurred while fetching specifications.');
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

/* Add Specification */
const addSpecification = async (payload: Record<string, any>) => {
    try {
        const response = await api.post(Apis.AddSpecification, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to add specification.');
            return null;
        }

        showTopCenterNotification('Specification added successfully!');
        return response.data;
    } catch (error) {
        console.error('Error adding specification:', error);
        showTopCenterNotification('An error occurred while adding the specification.');
        return null;
    }
};

/* Update Specification */
const updateSpecification = async (payload: Record<string, any>) => {
    try {
        const response = await api.put(Apis.UpdateSpecification, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update specification.');
            return null;
        }

        showTopCenterNotification('Specification updated successfully!');
        return response.data;
    } catch (error) {
        console.error('Error updating specification:', error);
        showTopCenterNotification('An error occurred while updating the specification.');
        return null;
    }
};

/* Get Specification by ID */
const getSpecificationById = async (id: number, lang: string) => {
    try {
        const response = await api.get(Apis.GetSpecificationById, { params: { id, lang } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Specification not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching specification by ID:', error);
        showTopCenterNotification('An error occurred while fetching the specification.');
        return null;
    }
};

/* Delete Specification */
const deleteSpecification = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeleteSpecification, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete specification.');
            return false;
        }

        showTopCenterNotification('Specification deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting specification:', error);
        showTopCenterNotification('An error occurred while deleting the specification.');
        return false;
    }
};

/* Bulk Delete Specifications */
const bulkDeleteSpecifications = async (ids: number[]) => {
    try {
        const response = await api.delete(Apis.BulkDeleteSpecifications, { data: { ids } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete specifications.');
            return false;
        }

        showTopCenterNotification('Specifications deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting specifications:', error);
        showTopCenterNotification('An error occurred while deleting specifications.');
        return false;
    }
};

/* ===== Specification Value API Calls ===== */

/* List Specification Values */
const listSpecificationValues = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetSpecificationValueList, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No specification values found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching specification values:', error);
        showTopCenterNotification('An error occurred while fetching specification values.');
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

/* Add Specification Value */
const addSpecificationValue = async (payload: Record<string, any>) => {
    try {
        const response = await api.post(Apis.AddSpecificationValue, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to add specification value.');
            return null;
        }

        showTopCenterNotification('Specification value added successfully!');
        return response.data;
    } catch (error) {
        console.error('Error adding specification value:', error);
        showTopCenterNotification('An error occurred while adding the specification value.');
        return null;
    }
};

/* Update Specification Value */
const updateSpecificationValue = async (payload: Record<string, any>) => {
    try {
        const response = await api.put(Apis.UpdateSpecificationValue, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update specification value.');
            return null;
        }

        showTopCenterNotification('Specification value updated successfully!');
        return response.data;
    } catch (error) {
        console.error('Error updating specification value:', error);
        showTopCenterNotification('An error occurred while updating the specification value.');
        return null;
    }
};

/* Get Specification Value by ID */
const getSpecificationValueById = async (id: number, lang: string) => {
    try {
        const response = await api.get(Apis.GetSpecificationValueById, { params: { id, lang } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Specification value not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching specification value by ID:', error);
        showTopCenterNotification('An error occurred while fetching the specification value.');
        return null;
    }
};

/* Delete Specification Value */
const deleteSpecificationValue = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeleteSpecificationValue, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete specification value.');
            return false;
        }

        showTopCenterNotification('Specification value deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting specification value:', error);
        showTopCenterNotification('An error occurred while deleting the specification value.');
        return false;
    }
};

/* Bulk Delete Specification Values */
const bulkDeleteSpecificationValues = async (ids: number[]) => {
    try {
        const response = await api.delete(Apis.BulkDeleteSpecificationValues, { data: { ids } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete specification values.');
            return false;
        }

        showTopCenterNotification('Specification values deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting specification values:', error);
        showTopCenterNotification('An error occurred while deleting specification values.');
        return false;
    }
};

export default {
    listSpecifications,
    addSpecification,
    updateSpecification,
    getSpecificationById,
    deleteSpecification,
    bulkDeleteSpecifications,
    listSpecificationValues,
    addSpecificationValue,
    updateSpecificationValue,
    getSpecificationValueById,
    deleteSpecificationValue,
    bulkDeleteSpecificationValues,
};
