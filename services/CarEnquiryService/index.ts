import axios from 'axios';
import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';
import Swal from 'sweetalert2';




const showNotification = (message: string = '', icon: 'success' | 'error' = 'success') => {
    Swal.fire({
        title: message || (icon === 'error' ? 'Error' : 'Success'),
        icon,
        timer: 3000,
    });
};

export const addCarEnquiry = async (payload: Record<string, any>) => {
    try {
        const response = await api.post(Apis.AddCarEnquiry, payload);
        if (!response || !response.data.success) {
            showNotification('Failed to submit enquiry.', 'error');
            return null;
        }
        showNotification('Enquiry submitted successfully!');
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('Error adding enquiry:', error.response?.data?.message);
            showNotification(error.response?.data?.message || 'Error adding enquiry.', 'error');
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return null;
    }
};

export const getCarEnquiries = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetCarEnquiryList, { params });
        if (!response || !response.data.success) {
            showNotification('Failed to retrieve enquiries.', 'error');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching enquiries:', error.response?.data?.message);
            showNotification(error.response?.data?.message || 'Error fetching enquiries.', 'error');
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

export const getCarEnquiryById = async (id: number) => {
    try {
        const response = await api.get(Apis.GetCarEnquiryById, { params: { id } });
        if (!response || !response.data.success) {
            showNotification('Enquiry not found.', 'error');
            return null;
        }
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching enquiry by ID:', error.response?.data?.message);
            showNotification(error.response?.data?.message || 'Error fetching enquiry.', 'error');
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return null;
    }
};

export const deleteCarEnquiry = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeleteCarEnquiry, { params: { id } });
        if (!response || !response.data.success) {
            showNotification('Failed to delete enquiry.', 'error');
            return false;
        }
        showNotification('Enquiry deleted successfully!');
        return true;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('Error deleting enquiry:', error.response?.data?.message);
            showNotification(error.response?.data?.message || 'Error deleting enquiry.', 'error');
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return false;
    }
};

export default {
    addCarEnquiry,
    getCarEnquiries,
    getCarEnquiryById,
    deleteCarEnquiry,
};
