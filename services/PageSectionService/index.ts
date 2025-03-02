import Swal from 'sweetalert2';

import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';
import axios from 'axios';



const showNotification = (
    message: string = '',
    icon: 'success' | 'error' = 'success'
) => {
    Swal.fire({
        title: message || (icon === 'error' ? 'Error' : 'Success'),
        icon,
        timer: 3000,
    });
};

/* List Page Sections */
export const listPageSections = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetPageSectionList, { params });
        if (
            !response ||
            !response.data.success ||
            !response.data.data?.length
        ) {
            showNotification('No page sections found.', 'error');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching page sections:', error.response?.data?.message);
            showNotification(
                error.response?.data?.message ||
                'An error occurred while fetching page sections.',
                'error'
            );
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

/* Get Page Section by ID */
export const getPageSectionById = async (id: number, lang: string = 'en') => {
    try {
        const response = await api.get(Apis.GetPageSectionById, { params: { id, lang } });
        if (!response || !response.data.success) {
            showNotification('Page section not found.', 'error');
            return null;
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching page section by ID:', error.response?.data?.message);
            showNotification(
                error.response?.data?.message || 'An error occurred while fetching page section.',
                'error'
            );
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return null;
    }
};

export const getPageSectionBySlug = async (slug: string, lang: string = 'en') => {
    try {
        const response = await api.get(Apis.GetPageSectionBySlug, { params: { slug, lang } });
        if (!response || !response.data.success) {
            showNotification('Page section not found.', 'error');
            return null;
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching page section by slug:', error.response?.data?.message);
            showNotification(
                error.response?.data?.message || 'An error occurred while fetching page section.',
                'error'
            );
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return null;
    }
};

/* Add Page Section */
export const addPageSection = async (payload: Record<string, any>) => {
    // Remove translation-specific fields if they exist (the backend will auto-generate translations)
    const { translationContent, language, ...restPayload } = payload;
    try {
        const response = await api.post(Apis.AddPageSection, restPayload);
        if (!response || !response.data.success) {
            showNotification('Failed to add page section.', 'error');
            return null;
        }
        showNotification('Page section added successfully!');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error adding page section:', error.response?.data?.message);
            showNotification(
                error.response?.data?.message ||
                'An error occurred while adding page section.',
                'error'
            );
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return null;
    }
};

/* Update Page Section */
export const updatePageSection = async (payload: Record<string, any>) => {
    // Remove translation-specific fields; backend will update translations if default content changes.
    const { translationContent, language, ...restPayload } = payload;
    try {
        const response = await api.put(Apis.UpdatePageSection, restPayload);
        if (!response || !response.data.success) {
            showNotification('Failed to update page section.', 'error');
            return null;
        }
        showNotification('Page section updated successfully!');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error updating page section:', error.response?.data?.message);
            showNotification(
                error.response?.data?.message ||
                'An error occurred while updating page section.',
                'error'
            );
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return null;
    }
};

/* Delete Page Section */
export const deletePageSection = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeletePageSection, { params: { id } });
        if (!response || !response.data.success) {
            showNotification('Failed to delete page section.', 'error');
            return false;
        }
        showNotification('Page section deleted successfully!');
        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error deleting page section:', error.response?.data?.message);
            showNotification(
                error.response?.data?.message ||
                'An error occurred while deleting page section.',
                'error'
            );
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return false;
    }
};

/* Bulk Delete Page Sections */
export const bulkDeletePageSections = async (ids: number[]) => {
    try {
        const response = await api.delete(Apis.BulkDeletePageSections, { data: { ids } });
        if (!response || !response.data.success) {
            showNotification('Failed to delete page sections.', 'error');
            return false;
        }
        showNotification('Page sections deleted successfully!');
        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error bulk deleting page sections:', error.response?.data?.message);
            showNotification(
                error.response?.data?.message ||
                'An error occurred while deleting page sections.',
                'error'
            );
        } else {
            console.error('Unexpected error:', error);
            showNotification('An unexpected error occurred.', 'error');
        }
        return false;
    }
};


export default {
    listPageSections,
    getPageSectionById,
    addPageSection,
    updatePageSection,
    deletePageSection,
    bulkDeletePageSections,
};
