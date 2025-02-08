'use client';
import React, { useEffect, useState } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Select, { SingleValue, StylesConfig } from 'react-select';
import Swal from 'sweetalert2';
import Link from 'next/link';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconPlus from '@/components/icon/icon-plus';
import GetUserDetails from '@/services/GetUserDetails';
import IconRefresh from '../icon/icon-refresh';
import IconXCircle from '../icon/icon-x-circle';
import IconCircleCheck from '../icon/icon-circle-check';

// Status options for the dropdown
const statusOptions = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'deleted', label: 'Deleted' },
];


const customStyles: StylesConfig<any, boolean> = {
    control: (provided) => ({
        ...provided,
        minWidth: '150px',  // Adjust width as needed
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,  // Increase z-index to ensure dropdown is on top
    }),
};


// Define user type
type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    verify: boolean;
    status: 'active' | 'inactive' | 'deleted';
    createdAt: string;
};

const UserListingTable: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState<number>(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [paginationInfo, setPaginationInfo] = useState<{ totalItems: number, totalPages: number }>({ totalItems: 0, totalPages: 0 });
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'firstName',
        direction: 'asc',
    });

    useEffect(() => {
        fetchUsers();
    }, [page, pageSize, search, sortStatus, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {
                page,
                limit: pageSize,
                sortBy: sortStatus.columnAccessor,
                order: sortStatus.direction.toUpperCase(),
            };

            if (search.trim()) params.search = search.trim();
            if (statusFilter) params.status = statusFilter;

            const response = await GetUserDetails.listUser(params);
            setUsers(response.data);
            setPaginationInfo(response.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1); // Reset to page 1 when pageSize changes
    }, [pageSize]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const toggleUserStatus = async (id: number, currentStatus: 'active' | 'inactive') => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await GetUserDetails.updateUserStatus(id, newStatus);
            setUsers(users.map(user => (user.id === id ? { ...user, status: newStatus } : user)));

            Swal.fire('Success', `User status updated to ${newStatus}`, 'success');
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };


    const deleteUser = async (id: number) => {
        try {
            await GetUserDetails.deleteUser(id);
            setUsers(users.map(user => (user.id === id ? { ...user, status: 'deleted' } : user)));

            Swal.fire('Deleted!', 'User has been deleted.', 'success');
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const restoreUser = async (id: number) => {
        try {
            await GetUserDetails.restoreUser(id);
            setUsers(users.map(user => (user.id === id ? { ...user, status: 'active' } : user)));

            Swal.fire('Restored!', 'User has been restored.', 'success');
        } catch (error) {
            console.error('Error restoring user:', error);
        }
    };

    const bulkDeleteUsers = async () => {
        if (selectedUsers.length === 0) {
            Swal.fire('No Users Selected', 'Please select at least one user.', 'info');
            return;
        }

        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: 'This action will soft delete the selected users.',
            showCancelButton: true,
            confirmButtonText: 'Delete',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const ids = selectedUsers.map((user) => user.id);
                    await GetUserDetails.bulkDeleteUser(ids);
                    setUsers(users.map(user => (ids.includes(user.id) ? { ...user, status: 'deleted' } : user)));

                    Swal.fire('Deleted!', 'Users have been deleted.', 'success');
                    setSelectedUsers([]);
                } catch (error) {
                    console.error('Error deleting users:', error);
                }
            }
        });
    };

    return (
        <div className="panel border-white-light px-0">
            <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                    {selectedUsers.length > 0 && (
                        <button className="btn btn-danger" onClick={() => {/* Bulk Delete Logic */ }}>
                            <IconTrashLines /> Bulk Delete
                        </button>
                    )}
                </div>
                <div className="ltr:ml-auto flex items-center gap-2">
                    <input
                        type="text"
                        className="form-input w-auto"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Select
                        options={statusOptions}
                        onChange={(e: SingleValue<{ value: string; label: string }>) => setStatusFilter(e?.value || null)}
                        styles={customStyles}
                    />
                </div>
            </div>

            <div className="datatables pagination-padding">
                {loading ? (
                    <div className="text-center p-4">Loading users...</div>
                ) : (
                    <DataTable
                        records={users}
                        columns={[
                            { accessor: 'id', title: 'ID', sortable: true },
                            { accessor: 'firstName', title: 'First Name', sortable: true },
                            { accessor: 'lastName', title: 'Last Name', sortable: true },
                            { accessor: 'email', title: 'Email', sortable: true },
                            { accessor: 'phone', title: 'Phone', sortable: false },
                            { accessor: 'role', title: 'Role', sortable: true },
                            {
                                accessor: 'status',
                                title: 'Status',
                                render: ({ status }) => {
                                    const statusColors = {
                                        active: 'bg-success',
                                        inactive: 'bg-warning',
                                        deleted: 'bg-danger',
                                    };
                                    return <span className={`badge ${statusColors[status]}`}>{status}</span>;
                                },
                            },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                render: ({ id, status }) => (
                                    <div className="mx-auto flex w-max items-center gap-4">
                                        <Link href={`/users/edit/${id}`} className="flex hover:text-info">
                                            <IconEdit />
                                        </Link>
                                        {status === 'deleted' ? (
                                            <button onClick={() => restoreUser(id)} className="flex hover:text-primary">
                                                <IconRefresh />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => toggleUserStatus(id, status)}
                                                className={`${status === 'active' ? 'hover:text-warning' : 'hover:text-success'}`}
                                            >
                                                {status === 'active' ? <IconXCircle /> : <IconCircleCheck />}
                                            </button>
                                        )}

                                        {status !== 'deleted' && (
                                            <button onClick={() => deleteUser(id)} className="btn btn-danger">
                                                <IconTrashLines />
                                            </button>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        selectedRecords={selectedUsers}
                        onSelectedRecordsChange={setSelectedUsers}
                        totalRecords={paginationInfo.totalItems} // ✅ Add total records count
                        recordsPerPage={pageSize} // ✅ Set page size
                        page={page} // ✅ Track current page
                        onPageChange={handlePageChange} // ✅ Handle page change
                        recordsPerPageOptions={PAGE_SIZES} // ✅ Allow user to select page size
                        onRecordsPerPageChange={setPageSize} // ✅ Handle page size change
                        paginationText={({ from, to, totalRecords }) =>
                            `Showing ${from} to ${to} of ${totalRecords} entries`
                        }
                    />
                )}
            </div>
        </div>
    );
};

export default UserListingTable;
