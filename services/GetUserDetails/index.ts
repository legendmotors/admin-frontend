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
const updateUserStatus = async (id: number, status: string) => {
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

// ✅ Fetch List of Roles
const listRoles = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetAllRoles, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No roles found.');
            return [];
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching roles:', error);
        showTopCenterNotification('An error occurred while fetching roles.');
        return [];
    }
};

// ✅ Create Role
const createRole = async (roleData: { name: string; description: string }) => {
    try {
        const response = await api.post(Apis.CreateRole, roleData);

        // Handle success
        if (response?.data?.success) {
            showTopCenterNotification('Role created successfully.');
            return response.data.data; // Return the created role details
        }

        // Handle failure from backend
        const errorMessage = response?.data?.message || 'Failed to create role.';
        showTopCenterNotification(errorMessage);
        return null;
    } catch (error: any) {
        console.error('Axios Error Response:', error.response); // Log the full error response

        // Extract and throw the backend error message
        const errorMessage =
            error?.response?.data?.message || 'An unexpected error occurred while creating the role.';
        throw new Error(errorMessage); // Throw to be handled in `handleSubmit`
    }
};


// ✅ Update Role
const updateRole = async (payload: Record<string, any>) => {
    try {
        // Send PUT request to update the role
        const response = await api.put(Apis.UpdateRole, payload)

        // Handle success
        if (response?.data?.success) {
            showTopCenterNotification('Role updated successfully.');
            return response.data; // Return the updated role details
        }

        // Handle failure from backend
        const errorMessage = response?.data?.message || 'Failed to update role.';
        showTopCenterNotification(errorMessage);
        return null;
    } catch (error: any) {
        console.error('Axios Error Response:', error.response); // Log the full error response

        // Extract and throw the backend error message
        const errorMessage =
            error?.response?.data?.message || 'An unexpected error occurred while updating the role.';
        showTopCenterNotification(errorMessage);
        throw new Error(errorMessage); // Throw to be handled in the component
    }
};

const getRoleById = async (id: number) => {
    try {
        const response = await api.get(Apis.GetRoleById, { params: { id } }); // Replace with the correct API endpoint

        if (!response || response.data.success === false) {
            throw new Error(response.data.message || 'Failed to fetch role.');
        }

        return response.data; // Return role data
    } catch (error: any) {
        console.error('Error fetching role by ID:', error);
        throw new Error(error?.response?.data?.message || 'An unexpected error occurred.');
    }
};



// ✅ Assign Role to User
const assignRoleToUser = async (userId: number, roleId: number) => {
    try {
        const response = await api.post(Apis.AssignRoleToUser, { userId, roleId });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to assign role to user.');
            return null;
        }

        showTopCenterNotification('Role assigned to user successfully.');
        return response.data;
    } catch (error) {
        console.error('Error assigning role to user:', error);
        showTopCenterNotification('An error occurred while assigning role.');
        return null;
    }
};

// ✅ Create Permission
const createPermission = async (permissionData: { name: string; description: string }) => {
    try {
        const response = await api.post(Apis.CreatePermission, permissionData);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to create permission.');
            return null;
        }

        showTopCenterNotification('Permission created successfully.');
        return response.data.data;
    } catch (error) {
        console.error('Error creating permission:', error);
        showTopCenterNotification('An error occurred while creating permission.');
        return null;
    }
};

// ✅ Get All Permissions
const getAllPermissions = async (params?: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetAllPermissions, { params });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to fetch permissions.');
            return [];
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching permissions:', error);
        showTopCenterNotification('An error occurred while fetching permissions.');
        return [];
    }
};

// ✅ Get Permission by ID
const getPermissionById = async (id: number) => {
    try {
        const response = await api.get(Apis.GetPermissionById, { params: { id } });

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to fetch permission details.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching permission by ID:', error);
        showTopCenterNotification('An error occurred while fetching permission details.');
        return null;
    }
};

// ✅ Update Permission
const updatePermission = async (payload: Record<string, any>) => {
    try {
        const response = await api.put(Apis.UpdatePermission, payload)

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to update permission.');
            return null;
        }

        showTopCenterNotification('Permission updated successfully.');
        return response.data;
    } catch (error) {
        console.error('Error updating permission:', error);
        showTopCenterNotification('An error occurred while updating permission.');
        return null;
    }
};

// ✅ Delete Permission
const deletePermission = async (id: number) => {
    try {
        const response = await api.delete(`${Apis.DeletePermission}/${id}`);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to delete permission.');
            return null;
        }

        showTopCenterNotification('Permission deleted successfully.');
        return response.data.data;
    } catch (error) {
        console.error('Error deleting permission:', error);
        showTopCenterNotification('An error occurred while deleting permission.');
        return null;
    }
};

// Adjust the signature to accept an object instead of two separate parameters
const assignPermissionsToRole = async (
    payload: { roleId: number; permissions: number[] }
  ) => {
    try {
      // Destructure the payload
      const { roleId, permissions } = payload;
  
      const response = await api.post(Apis.AssignPermissionsToRole, {
        roleId,
        permissions,
      });
  
      if (!response || response.data.success === false) {
        showTopCenterNotification('Failed to assign permissions to role.');
        return null;
      }
  
      showTopCenterNotification('Permissions assigned successfully.');
      return response.data;
    } catch (error) {
      console.error('Error assigning permissions to role:', error);
      showTopCenterNotification('An error occurred while assigning permissions.');
      return null;
    }
  };
  

// ✅ Get Permissions for a Role
const getPermissionsForRole = async (roleId: number) => {
    try {
        const response = await api.get(`${Apis.GetPermissionsForRole}?roleId=${roleId}`);

        if (!response || response.data.success === false) {
            showTopCenterNotification('Failed to fetch permissions for role.');
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('Error fetching permissions for role:', error);
        showTopCenterNotification('An error occurred while fetching permissions.');
        return null;
    }
};

export default {
    listUser,
    getUserById,
    deleteUser,
    bulkDeleteUser,
    restoreUser,
    updateUserStatus,
    updateUser,
    listRoles,
    createRole,
    updateRole,
    getRoleById,
    createPermission,
    assignPermissionsToRole,
    getPermissionsForRole,
    assignRoleToUser,
    getAllPermissions,
    getPermissionById,
    updatePermission,
    deletePermission
};
