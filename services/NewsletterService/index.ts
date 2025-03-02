import Swal from 'sweetalert2';

import axios from 'axios';
import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';



const showNotification = (message: string = '', icon: 'success' | 'error' = 'success') => {
    Swal.fire({
        title: message || (icon === 'error' ? 'Error' : 'Success'),
        icon,
        timer: 3000,
    });
};

export const subscribeNewsletter = async (payload: { email: string; name?: string }) => {
    try {
        const response = await api.post(Apis.AddNewsletter, payload);
        if (!response || !response.data.success) {
            showNotification('Failed to subscribe.', 'error');
            return null;
        }
        showNotification('Subscribed successfully!');
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('Error subscribing:', error.response?.data?.message);
            showNotification(error.response?.data?.message || 'Error subscribing.', 'error');
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return null;
    }
};

export const getSubscribers = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetNewsletterList, { params });
        if (!response || !response.data.success) {
            showNotification('Failed to retrieve subscribers.', 'error');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching subscribers:', error.response?.data?.message);
            showNotification(error.response?.data?.message || 'Error fetching subscribers.', 'error');
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

export const deleteSubscriber = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeleteNewsletter, { params: { id } });
        if (!response || !response.data.success) {
            showNotification('Failed to delete subscriber.', 'error');
            return false;
        }
        showNotification('Subscriber deleted successfully!');
        return true;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('Error deleting subscriber:', error.response?.data?.message);
            showNotification(error.response?.data?.message || 'Error deleting subscriber.', 'error');
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return false;
    }
};

export const unsubscribeNewsletter = async (email: string) => {
    try {
        const response = await api.put(Apis.UnsubscribeNewsletter, { email });
        if (!response || !response.data.success) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response?.data?.msg || 'Failed to unsubscribe.',
            });
            return false;
        }
        Swal.fire({
            icon: 'success',
            title: 'Unsubscribed!',
            text: 'You have been unsubscribed from the newsletter.',
        });
        return true;
    } catch (error: any) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'An error occurred while unsubscribing.',
        });
        return false;
    }
};


export default {
    subscribeNewsletter,
    getSubscribers,
    deleteSubscriber,
    unsubscribeNewsletter
};
