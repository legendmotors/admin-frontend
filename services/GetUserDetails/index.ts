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

// ✅ Fetch List of Users
const listUser = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetUserList, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No users found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        showTopCenterNotification('An error occurred while fetching users.');
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};

// ✅ Fetch User by ID
const getUserById = async (id: number) => {
    try {
        const response = await api.get(`${Apis.GetUserById}?id=${id}`);

        if (!response || response.data.success === false) {
            showTopCenterNotification('User not found.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        showTopCenterNotification('An error occurred while fetching user details.');
        return null;
    }
};

// ✅ Soft Delete Single User
const deleteUser = async (id: number) => {
    try {
        const response = await api.put(Apis.DeleteUser, { id }); // Use PUT for soft delete

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete user.');
            return { success: false };
        }

        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        showTopCenterNotification('An error occurred while deleting user.');
        return { success: false };
    }
};

// ✅ Soft Delete Bulk Users
const bulkDeleteUser = async (ids: number[]) => {
    try {
        const response = await api.put(Apis.BulkDeleteUser, { ids }); // Use PUT for soft delete

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete users.');
            return { success: false };
        }

        return response.data;
    } catch (error) {
        console.error('Error deleting users:', error);
        showTopCenterNotification('An error occurred while deleting users.');
        return { success: false };
    }
};

// ✅ Restore Deleted User
const restoreUser = async (id: number) => {
    try {
        const response = await api.put(Apis.RestoreUser, { id }); // Use PUT to restore

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to restore user.');
            return { success: false };
        }

        return response.data;
    } catch (error) {
        console.error('Error restoring user:', error);
        showTopCenterNotification('An error occurred while restoring user.');
        return { success: false };
    }
};
// ✅ Toggle User Status (Active <-> Inactive)
const updateUserStatus = async (id: number, status: 'active' | 'inactive') => {
    try {
        const response = await api.put(Apis.UpdateUserStatus, { id, status });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update user status.');
            return { success: false };
        }

        return response.data;
    } catch (error) {
        console.error('Error updating user status:', error);
        showTopCenterNotification('An error occurred while updating user status.');
        return { success: false };
    }
};


// ✅ Update User
const updateUser = async (id: number, updatedData: Record<string, any>) => {
    try {
        const payload = { id, ...updatedData };
        const response = await api.put(Apis.UpdateUser, payload);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update user.');
            return { success: false };
        }

        showTopCenterNotification('User updated successfully.');
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        showTopCenterNotification('An error occurred while updating user.');
        return { success: false };
    }
};

export default {
    listUser,
    getUserById,
    deleteUser,
    bulkDeleteUser,
    restoreUser,
    updateUserStatus,
    updateUser
};
