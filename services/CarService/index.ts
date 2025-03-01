import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';
import axios from 'axios';

const MySwal = withReactContent(Swal);

// Show notification at the top center as a toast
const showTopCenterNotification = (message: string) => {
    Swal.fire({
        title: message || 'Error',
        icon: 'success',
        timer: 3000,
    });
};

const showErrorNotification = (message: string) => {
    Swal.fire({
        title: message || 'Error',
        icon: 'warning',
        timer: 3000,
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
        if (axios.isAxiosError(error)) {
            console.error('Error fetching car list:', error.response?.data?.message);
            showErrorNotification(
                error.response?.data?.message || 'An error occurred while fetching the car list.'
            );
        } else {
            console.error('Unexpected error:', error);
            showErrorNotification('An unexpected error occurred.');
        }
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

/* Add Car */
const addCar = async (payload: Record<string, any>) => {
    try {
        const response = await api.post(Apis.AddCar, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to add car.');
            return null;
        }
        showTopCenterNotification('Car added successfully!');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error adding car:', error.response?.data?.message);
            showErrorNotification(
                error.response?.data?.message || 'An error occurred while adding the car.'
            );
        } else {
            console.error('Unexpected error:', error);
            showErrorNotification('An unexpected error occurred.');
        }
        return null;
    }
};

/* Update Car */
const updateCar = async (payload: Record<string, any>) => {
    try {
        const response = await api.put(Apis.UpdateCar, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update car.');
            return null;
        }
        showTopCenterNotification('Car updated successfully!');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error adding car:', error.response?.data?.message);
            showErrorNotification(
                error.response?.data?.message || 'An error occurred while adding the car.'
            );
        } else {
            console.error('Unexpected error:', error);
            showErrorNotification('An unexpected error occurred.');
        }
        return null;
    }
};

/* Get Car by ID or Slug */
const getCarByIdOrSlug = async (idOrSlug: number | string, lang = 'en') => {
    try {
        const params: any = { lang };
        if (typeof idOrSlug === 'number') {
            params.id = idOrSlug;
        } else {
            params.slug = idOrSlug;
        }
        const response = await api.get(Apis.GetCarByIdOrSlug, { params });
        if (!response || response.data.success === false) {
            showTopCenterNotification('Car not found.');
            return null;
        }
        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching car by ID or slug:', error.response?.data?.message);
            showErrorNotification(
                error.response?.data?.message || 'An error occurred while fetching the car.'
            );
        } else {
            console.error('Unexpected error:', error);
            showErrorNotification('An unexpected error occurred.');
        }
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
        if (axios.isAxiosError(error)) {
            console.error('Error fetching car by slug:', error.response?.data?.message);
            showErrorNotification(
                error.response?.data?.message || 'An error occurred while fetching the car.'
            );
        } else {
            console.error('Unexpected error:', error);
            showErrorNotification('An unexpected error occurred.');
        }
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
        if (axios.isAxiosError(error)) {
            console.error('Error deleting car:', error.response?.data?.message);
            showErrorNotification(
                error.response?.data?.message || 'An error occurred while deleting the car.'
            );
        } else {
            console.error('Unexpected error:', error);
            showErrorNotification('An unexpected error occurred.');
        }
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
        if (axios.isAxiosError(error)) {
            console.error('Error deleting cars:', error.response?.data?.message);
            showErrorNotification(
                error.response?.data?.message || 'An error occurred while deleting cars.'
            );
        } else {
            console.error('Unexpected error:', error);
            showErrorNotification('An unexpected error occurred.');
        }
        return false;
    }
};

/* Fuzzy Search Cars */
const fuzzySearch = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.FuzzySearchCars, { params });
        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No cars found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching fuzzy search cars:', error.response?.data?.message);
            showErrorNotification(
                error.response?.data?.message || 'An error occurred while fetching fuzzy search cars.'
            );
        } else {
            console.error('Unexpected error:', error);
            showErrorNotification('An unexpected error occurred.');
        }
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

export default {
    listCars,
    addCar,
    updateCar,
    getCarByIdOrSlug,
    getCarBySlug,
    deleteCar,
    bulkDeleteCars,
    fuzzySearch
};
