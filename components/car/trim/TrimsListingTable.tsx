'use client';

import IconEdit from '@/components/icon/icon-edit';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { getTranslation } from '@/i18n';
import { StylesConfig } from 'react-select';
import TrimService from '@/services/TrimService';
import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
type Trim = {
    id: number;
    name: string;
    slug: string;
    model: { id: number; name: string };
    status: 'draft' | 'published';
};

const TrimsListingTable: React.FC = () => {
    const { t, i18n } = getTranslation();
    const [items, setItems] = useState<Trim[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [paginationInfo, setPaginationInfo] = useState<{ totalItems: number; totalPages: number }>({ totalItems: 0, totalPages: 0 });
    const [initialRecords, setInitialRecords] = useState<Trim[]>([]);
    const [records, setRecords] = useState<Trim[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<Trim[]>([]);
    const [search, setSearch] = useState<string>('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [updating, setUpdating] = useState<boolean>(false);

    useEffect(() => {
        const fetchTrims = async () => {
            setLoading(true);
            try {
                const params: Record<string, any> = {
                    page,
                    limit: pageSize,
                    sortBy: sortStatus.columnAccessor,
                    order: sortStatus.direction.toUpperCase(),
                    lang: i18n.language,
                };

                if (search.trim()) params.search = search.trim();
                if (statusFilter) params.status = statusFilter;

                const response = await TrimService.listTrim(params);

                if (!response || !response.data.length) {
                    setItems([]);
                    setInitialRecords([]);
                    setRecords([]);
                    setPaginationInfo({ totalItems: 0, totalPages: 0 });
                    return;
                }

                const fetchedTrims: Trim[] = response.data;
                setItems(fetchedTrims);
                setInitialRecords(sortBy(fetchedTrims, 'name'));
                setRecords(sortBy(fetchedTrims, 'name'));
                setPaginationInfo(response.pagination);
            } catch (error) {
                console.error('Error fetching trims:', error);
                setItems([]);
                setInitialRecords([]);
                setRecords([]);
                setPaginationInfo({ totalItems: 0, totalPages: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchTrims();
    }, [page, pageSize, search, sortStatus, statusFilter, i18n.language]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const showDeleteConfirmation = (id: number | null) => {
        if (id === null && selectedRecords.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No Trims Selected',
                text: 'Please select at least one trim to delete.',
                confirmButtonText: 'OK',
            });
            return;
        }

        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (id !== null) {
                        await TrimService.deleteTrim(id);
                        const updatedItems = items.filter((trim) => trim.id !== id);
                        setItems(updatedItems);
                        setInitialRecords(updatedItems);
                        setRecords(updatedItems);
                    } else {
                        const ids = selectedRecords.map((d) => d.id);
                        await TrimService.bulkDeleteTrims(ids);
                        const updatedItems = items.filter((trim) => !ids.includes(trim.id));
                        setItems(updatedItems);
                        setInitialRecords(updatedItems);
                        setRecords(updatedItems);
                    }
                    setSelectedRecords([]);
                    setSearch('');

                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Your record(s) has been deleted.',
                        icon: 'success',
                    });

                    window.location.reload();
                } catch (error) {
                    console.error('Error deleting trims:', error);
                }
            }
        });
    };

    const updateStatus = async (newStatus: 'published' | 'draft') => {
        if (selectedRecords.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No Models Selected',
                text: 'Please select at least one model.',
                confirmButtonText: 'OK',
            });
            return;
        }

        const ids = selectedRecords.map((model) => model.id);

        try {
            setUpdating(true);
            const response = await axios.post(`${API_BASE_URL}/status/bulk-update`, {
                model: 'Trims',
                ids,
                status: newStatus,
            });

            if (response.data.success) {
                setItems((prevItems) =>
                    prevItems.map((trim) =>
                        ids.includes(trim.id) ? { ...trim, status: newStatus } : trim
                    )
                );
                setInitialRecords((prevRecords) =>
                    prevRecords.map((trim) =>
                        ids.includes(trim.id) ? { ...trim, status: newStatus } : trim
                    )
                );
                setRecords((prevRecords) =>
                    prevRecords.map((trim) =>
                        ids.includes(trim.id) ? { ...trim, status: newStatus } : trim
                    )
                );

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: `trim successfully updated to ${newStatus}`,
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error('Error updating model status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const statusOptions = [
        { value: '', label: 'All' },
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
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

    const handleStatusChange = (selectedOption: { value: string; label: string } | null) => {
        setStatusFilter(selectedOption?.value || null);
    };

    return (
        <div className="panel">
            <div className="invoice-table">
                <div className="mb-4 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        {selectedRecords.length > 0 && (
                            <>
                                <button type="button" className="btn btn-success" onClick={() => updateStatus('published')}>
                                    Publish
                                </button>
                                <button type="button" className="btn btn-warning" onClick={() => updateStatus('draft')}>
                                    Unpublish
                                </button>
                            </>
                        )}

                        <button type="button" className="btn btn-danger" onClick={() => showDeleteConfirmation(null)}>
                            <IconTrashLines /> Delete
                        </button>

                        <Link href="/trim/add" className="btn btn-primary">
                            <IconPlus /> Add New
                        </Link>
                    </div>
                    <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
                        <input
                            type="text"
                            className="form-input w-auto"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Select
                            options={statusOptions}
                            value={statusOptions.find((option) => option.value === (statusFilter || ''))}
                            onChange={handleStatusChange}
                            isSearchable={false}
                            placeholder="Select Status"
                            className="w-auto"
                            styles={customStyles}
                        />
                    </div>
                </div>

                <div className="datatables pagination-padding">
                    {loading ? (
                        <div className="text-center p-4">Loading trims...</div>
                    ) : (
                        <DataTable
                            records={records}
                            columns={[
                                { accessor: 'name', title: 'Name', sortable: true },
                                { accessor: 'slug', title: 'Slug', sortable: true },
                                { accessor: 'model.name', title: 'Model', sortable: true },
                                {
                                    accessor: 'status',
                                    title: 'Status',
                                    sortable: true,
                                    render: ({ status }) => {
                                        let badgeClass = '';

                                        switch (status) {
                                            case 'published':
                                                badgeClass = 'badge bg-success'; // Published -> Green
                                                break;
                                            case 'draft':
                                                badgeClass = 'badge bg-warning'; // Draft -> Yellow
                                                break;
                                            default:
                                                badgeClass = 'badge bg-secondary'; // Default -> Grey
                                        }

                                        return (
                                            <span className={badgeClass}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </span>
                                        );
                                    },
                                },
                                {
                                    accessor: 'action',
                                    title: 'Actions',
                                    render: ({ id }) => (
                                        <div className="flex gap-4">
                                            <Link href={`/trim/edit/${id}`} className="hover:text-info">
                                                <IconEdit />
                                            </Link>
                                            <button type="button" className="hover:text-danger" onClick={() => showDeleteConfirmation(id)}>
                                                <IconTrashLines />
                                            </button>
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
        </div>
    );
};

export default TrimsListingTable;
