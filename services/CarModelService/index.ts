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

/* List Car Models */
const listCarModel = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetCarModelList, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No car models found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching car models:', error);
        showTopCenterNotification('An error occurred while fetching car models.');
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

/* Add Car Model */
const addCarModel = async (payload: Record<string, any>) => {
    try {
        const response = await api.post(Apis.AddCarModel, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to add car model.');
            return null;
        }

        showTopCenterNotification('Car model added successfully!');
        return response.data;
    } catch (error) {
        console.error('Error adding car model:', error);
        showTopCenterNotification('An error occurred while adding the car model.');
        return null;
    }
};

/* Update Car Model */
const updateCarModel = async (payload: Record<string, any>) => {
    try {
        const response = await api.put(Apis.UpdateCarModel, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update car model.');
            return null;
        }

        showTopCenterNotification('Car model updated successfully!');
        return response.data;
    } catch (error) {
        console.error('Error updating car model:', error);
        showTopCenterNotification('An error occurred while updating the car model.');
        return null;
    }
};

/* Get Car Model by ID */
const getCarModelById = async (id: number) => {
    try {
        const response = await api.get(Apis.GetCarModelById, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Car model not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching car model by ID:', error);
        showTopCenterNotification('An error occurred while fetching the car model.');
        return null;
    }
};

/* Delete Car Model */
const deleteCarModel = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeleteCarModel, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete car model.');
            return false;
        }

        showTopCenterNotification('Car model deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting car model:', error);
        showTopCenterNotification('An error occurred while deleting the car model.');
        return false;
    }
};

/* Bulk Delete Car Models */
const bulkDeleteCarModels = async (ids: number[]) => {
    try {
        const response = await api.delete(Apis.BulkDeleteCarModels, { data: { ids } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete car models.');
            return false;
        }

        showTopCenterNotification('Car models deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting car models:', error);
        showTopCenterNotification('An error occurred while deleting car models.');
        return false;
    }
};

export default {
    listCarModel,
    addCarModel,
    updateCarModel,
    getCarModelById,
    deleteCarModel,
    bulkDeleteCarModels,
};
