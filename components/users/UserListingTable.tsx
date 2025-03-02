'use client';
import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconXCircle from '@/components/icon/icon-x-circle';
import IconCircleCheck from '@/components/icon/icon-circle-check';
import IconRefresh from '@/components/icon/icon-refresh';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import GetUserDetails from '@/services/GetUserDetails';
import Swal from 'sweetalert2';
import IconHelpCircle from '../icon/icon-help-circle';

type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: { id: number; name: string } | null;
    verify: boolean;
    status: 'active' | 'inactive' | 'deleted';
    createdAt: string;
};

const UserListingTable: React.FC = () => {
    // Optionally log fetched users for debugging
    useEffect(() => {
        (async () => {
            const data = await GetUserDetails.listUser({});
            console.log('Fetched users:', data);
        })();
    }, []);

    const userColumns = [
        { accessor: 'firstName', title: 'First Name', sortable: true },
        { accessor: 'lastName', title: 'Last Name', sortable: true },
        { accessor: 'email', title: 'Email', sortable: true },
        { accessor: 'phone', title: 'Phone', sortable: true },
        {
            accessor: 'role',
            title: 'Role',
            sortable: true,
            render: ({ role }: { role: { id: number; name: string } | null }) =>
                role ? role.name : 'N/A',
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ status }: { status: string }) => {
                const statusColors: Record<string, string> = {
                    active: 'badge bg-success',
                    inactive: 'badge bg-warning',
                    deleted: 'badge bg-danger',
                };
                return <span className={statusColors[status]}>{status}</span>;
            },
        },
    ];

    const actions = [
        {
            label: 'Edit',
            href: '/users/edit',
            className: 'btn btn-sm btn-info',
            icon: <IconEdit className="h-4.5 w-4.5" />,
            show: true,
        },
        {
            label: (row: User) => (row.status === 'active' ? 'Set Inactive' : 'Set Active'),      // Since the row is just a user id, we display a placeholder icon.
            icon: "",

            onClick: async (userId: number) => {
                console.log('Status action clicked for user id:', userId);

                // Fetch the full user details to determine the current status
                const user = await GetUserDetails.getUserById(userId);
                console.log('getUserById response:', user);
                if (!user) {
                    Swal.fire({
                        icon: 'error',
                        title: 'User not found',
                        text: 'Unable to fetch user details.',
                    });
                    return;
                }
                console.log('Current user status:', user.status);

                if (user.status === 'deleted') {
                    const restoreResponse = await GetUserDetails.restoreUser(userId);
                    console.log('restoreUser response:', restoreResponse);
                    if (restoreResponse.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'User Restored',
                            text: 'User restored successfully.',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Restore Failed',
                            text: 'Failed to restore user.',
                        });
                    }
                } else {
                    // Toggle status: if active, set to inactive; if inactive, set to active.
                    const newStatus = user.status === 'active' ? 'inactive' : 'active';
                    console.log('Toggling status to:', newStatus);
                    const updateResponse = await GetUserDetails.updateUserStatus(userId, newStatus);
                    console.log('updateUserStatus response:', updateResponse);
                    if (updateResponse.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Status Updated',
                            text: `User status updated to ${newStatus}.`,
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Update Failed',
                            text: 'Failed to update status.',
                        });
                    }
                }

            },
            show: true,
        },
        {
            label: 'Delete',
            icon: <IconTrashLines className="h-4.5 w-4.5" />,
            onClick: async (userId: number) => {
                console.log('Delete action clicked for user id:', userId);
                const result = await Swal.fire({
                    icon: 'warning',
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    showCancelButton: true,
                    confirmButtonText: 'Delete',
                });
                if (result.isConfirmed) {
                    const response = await GetUserDetails.deleteUser(userId);
                    console.log('deleteUser response:', response);
                    if (response.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted',
                            text: 'User deleted successfully.',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Deletion Failed',
                            text: 'Failed to delete user.',
                        });
                    }

                }
            },
            show: true,
        },
    ];

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4">User List</h1>
            <ReusableTable
                modelName="User"
                columns={userColumns}
                statusOptions={[
                    { value: '', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'deleted', label: 'Deleted' },
                ]}
                listService={GetUserDetails.listUser}
                deleteService={GetUserDetails.deleteUser}
                bulkDeleteService={GetUserDetails.bulkDeleteUser}
                actions={actions}
                // addUrl="/users/add"
            />
        </div>
    );
};

export default UserListingTable;
