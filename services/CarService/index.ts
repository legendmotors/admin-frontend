import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';

const MySwal = withReactContent(Swal);

// Show notification
const showTopCenterNotification = (message: string) => {
    MySwal.fire({
        title: message,
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
    });
};

/* List Cars */
const listCars = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetCarList, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No cars found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching car list:', error);
        showTopCenterNotification('An error occurred while fetching the car list.');
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

/* Add Car */
const addCar = async (payload: Record<string, any>) => {
    try {
        const response = await api.post(Apis.AddCar, payload, {
            headers: {
                'Content-Type': 'application/json', // Specify JSON
            },
        });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to add car.');
            return null;
        }

        showTopCenterNotification('Car added successfully!');
        return response.data;
    } catch (error) {
        console.error('Error adding car:', error);
        showTopCenterNotification('An error occurred while adding the car.');
        return null;
    }
};


/* Update Car */
const updateCar = async (payload: FormData) => {
    try {
        const response = await api.put(Apis.UpdateCar, payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update car.');
            return null;
        }

        showTopCenterNotification('Car updated successfully!');
        return response.data;
    } catch (error) {
        console.error('Error updating car:', error);
        showTopCenterNotification('An error occurred while updating the car.');
        return null;
    }
};

/* Get Car by ID */
const getCarById = async (id: number, lang = 'en') => {
    try {
        const response = await api.get(Apis.GetCarById, { params: { id, lang } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Car not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching car by ID:', error);
        showTopCenterNotification('An error occurred while fetching the car.');
        return null;
    }
};

/* Get Car by Slug */
const getCarBySlug = async (slug: string, lang = 'en') => {
    try {
        const response = await api.get(Apis.GetCarBySlug, { params: { slug, lang } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Car not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching car by slug:', error);
        showTopCenterNotification('An error occurred while fetching the car.');
        return null;
    }
};

/* Delete Car */
const deleteCar = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeleteCar, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete car.');
            return false;
        }

        showTopCenterNotification('Car deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting car:', error);
        showTopCenterNotification('An error occurred while deleting the car.');
        return false;
    }
};

/* Bulk Delete Cars */
const bulkDeleteCars = async (ids: number[]) => {
    try {
        const response = await api.delete(Apis.BulkDeleteCars, { data: { ids } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete cars.');
            return false;
        }

        showTopCenterNotification('Cars deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting cars:', error);
        showTopCenterNotification('An error occurred while deleting cars.');
        return false;
    }
};

export default {
    listCars,
    addCar,
    updateCar,
    getCarById,
    getCarBySlug,
    deleteCar,
    bulkDeleteCars,
};
