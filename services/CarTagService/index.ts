import Swal from 'sweetalert2';

import api from '@/utils/ApiConfig';
import { Apis } from '@/utils/apiUrls';
import axios from 'axios';



// Show notification
const showTopCenterNotification = (message: string = '') => {
    Swal.fire({
        title: message || 'Error',
        icon: 'success',
        timer: 3000,
    });
};

/* List Tags */
const listTags = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetTagList, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No tags found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching tags:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while fetching tags.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }

        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

/* Get Tag by ID */
const getTagById = async (id: number, lang: string) => {
    try {
        const response = await api.get(Apis.GetTagById, { params: { id, lang } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Tag not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching tag by ID:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while fetching the tag.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return null;
    }
};

/* Get Tag by Slug */
const getTagBySlug = async (slug: string) => {
    try {
        const response = await api.get(Apis.GetTagBySlug, { params: { slug } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Tag not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching tag by slug:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while fetching the tag.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return null;
    }
};

/* Add Tag */
const addTag = async (payload: Record<string, any>) => {
    try {
        const response = await api.post(Apis.AddTag, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to add tag.');
            return null;
        }

        showTopCenterNotification('Tag added successfully!');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error adding tag:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while adding the tag.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return null;
    }
};

/* Update Tag */
const updateTag = async (payload: Record<string, any>) => {
    try {
        const response = await api.put(Apis.UpdateTag, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update tag.');
            return null;
        }

        showTopCenterNotification('Tag updated successfully!');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error updating tag:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while updating the tag.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return null;
    }
};

/* Delete Tag */
const deleteTag = async (id: number) => {
    try {
        const response = await api.delete(Apis.DeleteTag, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete tag.');
            return false;
        }
        showTopCenterNotification('Tag deleted successfully!');
        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error deleting tag:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while deleting the tag.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return false;
    }
};

/* Bulk Delete Tags */
const bulkDeleteTags = async (ids: number[]) => {
    try {
        const response = await api.delete(Apis.BulkDeleteTags, { data: { ids } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete tags.');
            return false;
        }

        showTopCenterNotification('Tags deleted successfully!');
        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error deleting tags:', error.response?.data?.message);
            showTopCenterNotification(error.response?.data?.message || 'An error occurred while deleting tags.');
        } else {
            console.error('Unexpected error:', error);
            showTopCenterNotification('An unexpected error occurred.');
        }
        return false;
    }
};

export default {
    listTags,
    getTagById,
    getTagBySlug,
    addTag,
    updateTag,
    deleteTag,
    bulkDeleteTags,
};
