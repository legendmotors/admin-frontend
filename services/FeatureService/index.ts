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

/* ===== Feature API Calls ===== */

/* List Features */
const listFeatures = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetFeatureList, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No features found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching features:', error);
        showTopCenterNotification('An error occurred while fetching features.');
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

/* Add Feature */
const addFeature = async (payload: Record<string, any>) => {
    try {
        const response = await api.post(Apis.AddFeature, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to add feature.');
            return null;
        }

        showTopCenterNotification('Feature added successfully!');
        return response.data;
    } catch (error) {
        console.error('Error adding feature:', error);
        showTopCenterNotification('An error occurred while adding the feature.');
        return null;
    }
};

/* Update Feature */
const updateFeature = async (payload: Record<string, any>) => {
    try {
        const response = await api.put(Apis.UpdateFeature, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update feature.');
            return null;
        }

        showTopCenterNotification('Feature updated successfully!');
        return response.data;
    } catch (error) {
        console.error('Error updating feature:', error);
        showTopCenterNotification('An error occurred while updating the feature.');
        return null;
    }
};

/* Get Feature by ID */
const getFeatureById = async (id: number, lang: string) => {
    try {
        // Pass the `lang` parameter along with `id`
        const response = await api.get(Apis.GetFeatureById, { params: { id, lang } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Feature not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching feature by ID:', error);
        showTopCenterNotification('An error occurred while fetching the feature.');
        return null;
    }
};

/* Delete Feature */
const deleteFeature = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeleteFeature, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete feature.');
            return false;
        }

        showTopCenterNotification('Feature deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting feature:', error);
        showTopCenterNotification('An error occurred while deleting the feature.');
        return false;
    }
};

/* Bulk Delete Features */
const bulkDeleteFeatures = async (ids: number[]) => {
    try {
        const response = await api.delete(Apis.BulkDeleteFeatures, { data: { ids } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete features.');
            return false;
        }

        showTopCenterNotification('Features deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting features:', error);
        showTopCenterNotification('An error occurred while deleting features.');
        return false;
    }
};

/* ===== Feature Value API Calls ===== */

/* List Feature Values */
const listFeatureValues = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetFeatureValueList, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No feature values found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching feature values:', error);
        showTopCenterNotification('An error occurred while fetching feature values.');
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

/* Add Feature Value */
const addFeatureValue = async (payload: Record<string, any>) => {
    try {
        const response = await api.post(Apis.AddFeatureValue, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to add feature value.');
            return null;
        }

        showTopCenterNotification('Feature value added successfully!');
        return response.data;
    } catch (error) {
        console.error('Error adding feature value:', error);
        showTopCenterNotification('An error occurred while adding the feature value.');
        return null;
    }
};

/* Update Feature Value */
const updateFeatureValue = async (payload: Record<string, any>) => {
    try {
        const response = await api.put(Apis.UpdateFeatureValue, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update feature value.');
            return null;
        }

        showTopCenterNotification('Feature value updated successfully!');
        return response.data;
    } catch (error) {
        console.error('Error updating feature value:', error);
        showTopCenterNotification('An error occurred while updating the feature value.');
        return null;
    }
};

/* Get Feature Value by ID */
const getFeatureValueById = async (id: number, lang: string) => {
    try {
        const response = await api.get(Apis.GetFeatureValueById, { params: { id, lang } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Feature value not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching feature value by ID:', error);
        showTopCenterNotification('An error occurred while fetching the feature value.');
        return null;
    }
};


/* Delete Feature Value */
const deleteFeatureValue = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeleteFeatureValue, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete feature value.');
            return false;
        }

        showTopCenterNotification('Feature value deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting feature value:', error);
        showTopCenterNotification('An error occurred while deleting the feature value.');
        return false;
    }
};

/* Bulk Delete Feature Values */
const bulkDeleteFeatureValues = async (ids: number[]) => {
    try {
        const response = await api.delete(Apis.BulkDeleteFeatureValues, { data: { ids } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete feature values.');
            return false;
        }

        showTopCenterNotification('Feature values deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting feature values:', error);
        showTopCenterNotification('An error occurred while deleting feature values.');
        return false;
    }
};

export default {
    listFeatures,
    addFeature,
    updateFeature,
    getFeatureById,
    deleteFeature,
    bulkDeleteFeatures,
    listFeatureValues,
    addFeatureValue,
    updateFeatureValue,
    getFeatureValueById,
    deleteFeatureValue,
    bulkDeleteFeatureValues,
};
