'use client';
import React, { useEffect, useState } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import Select, { SingleValue, StylesConfig } from 'react-select';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import GetUserDetails from '@/services/GetUserDetails';
import Link from 'next/link';
import IconPlus from '../icon/icon-plus';
import IconEdit from '../icon/icon-edit';

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
        minWidth: '150px',
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
};

// Define role type
type Role = {
    id: number;
    name: string;
    description: string;
    status?: 'active' | 'inactive' | 'deleted';
    createdAt?: string;
};

const RolesListingTable: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState<number>(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [paginationInfo, setPaginationInfo] = useState<{ totalItems: number; totalPages: number }>({
        totalItems: 0,
        totalPages: 0,
    });
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });
    const [records, setRecords] = useState<Role[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<Role[]>([]);


    const fetchRoles = async () => {
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

            const response = await GetUserDetails.listRoles(params);
            if (!response || !response.data.length) {
                setRoles([]);
                setRecords([]);
                setPaginationInfo({ totalItems: 0, totalPages: 0 });
                return;
            }
            console.log(response);
            setRoles(response.data || []);
            setPaginationInfo(response.pagination || { totalItems: 0, totalPages: 0 });
        } catch (error) {
            console.error('Error fetching roles:', error);
            setPaginationInfo({ totalItems: 0, totalPages: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, [page, pageSize, search, sortStatus]);

    useEffect(() => {
        setPage(1); // Reset to page 1 when pageSize changes
    }, [pageSize]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };


    return (
        <div className="panel border-white-light px-0">
            <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                    <Link href="/users/roles/add" className="btn btn-primary gap-2">
                        <IconPlus />
                        Add New
                    </Link>
                </div>
                <div className="ltr:ml-auto flex items-center gap-2">
                    <input
                        type="text"
                        className="form-input w-auto"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="datatables pagination-padding">
                {loading ? (
                    <div className="text-center p-4">Loading roles...</div>
                ) : (
                    <DataTable
                        records={roles}
                        columns={[
                            { accessor: 'id', title: 'ID', sortable: true },
                            { accessor: 'name', title: 'Name', sortable: true },
                            { accessor: 'description', title: 'Description', sortable: false },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                render: ({ id }) => (
                                    <div className="flex gap-4">
                                        <Link href={`/users/roles/edit/${id}`} className="hover:text-info">
                                            <IconEdit />
                                        </Link>
                                    </div>
                                ),
                            },
                        ]}

                        highlightOnHover
                        totalRecords={paginationInfo.totalItems}  // Correct prop to pass total records
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={handlePageChange}  // Handle page change
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        selectedRecords={selectedRecords}
                        onSelectedRecordsChange={setSelectedRecords}
                        paginationText={({ from, to, totalRecords }) =>
                            `Showing ${from} to ${to} of ${totalRecords} entries`
                        }
                    />
                )}
            </div>
        </div>
    );
};

export default RolesListingTable;
