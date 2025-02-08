'use client';

import IconEdit from '@/components/icon/icon-edit';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import IconEye from '@/components/icon/icon-eye';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { getTranslation } from '@/i18n';
import { StylesConfig } from 'react-select';
import CarModelService from '@/services/CarModelService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type CarModel = {
    id: number;
    name: string;
    slug: string;
    brandId: number;
    status: 'draft' | 'published';
};

const CarModelListingTable: React.FC = () => {
    const { t, i18n } = getTranslation();
    const [items, setItems] = useState<CarModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [paginationInfo, setPaginationInfo] = useState<{ totalItems: number, totalPages: number }>({ totalItems: 0, totalPages: 0 });
    const [initialRecords, setInitialRecords] = useState<CarModel[]>([]);
    const [records, setRecords] = useState<CarModel[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<CarModel[]>([]);
    const [search, setSearch] = useState<string>('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [updating, setUpdating] = useState<boolean>(false);

    useEffect(() => {
        const fetchCarModels = async () => {
            setLoading(true);
            try {
                const params: Record<string, any> = {
                    page,
                    limit: pageSize,
                    sortBy: sortStatus.columnAccessor,
                    order: sortStatus.direction.toUpperCase(),
                    lang: i18n.language,
                };

                if (search?.trim()) params.search = search.trim();
                if (statusFilter) params.status = statusFilter;

                const response = await CarModelService.listCarModel(params);

                if (!response || !response.data.length) {
                    setItems([]);
                    setInitialRecords([]);
                    setRecords([]);
                    setPaginationInfo({ totalItems: 0, totalPages: 0 });
                    return;
                }

                const fetchedCarModels = response.data;
                setItems(fetchedCarModels);
                setInitialRecords(sortBy(fetchedCarModels, 'name'));
                setRecords(sortBy(fetchedCarModels, 'name'));
                setPaginationInfo(response.pagination);
            } catch (error) {
                console.error('Error fetching car models:', error);
                setItems([]);
                setInitialRecords([]);
                setRecords([]);
                setPaginationInfo({ totalItems: 0, totalPages: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchCarModels();
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
                title: 'No Models Selected',
                text: 'Please select at least one model to delete.',
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
                        await CarModelService.deleteCarModel(id);
                        const updatedItems = items.filter((model) => model.id !== id);
                        setItems(updatedItems);
                        setInitialRecords(updatedItems);
                        setRecords(updatedItems);
                    } else {
                        const ids = selectedRecords.map((d) => d.id);
                        await CarModelService.bulkDeleteCarModels(ids);
                        const updatedItems = items.filter((model) => !ids.includes(model.id));
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
                    console.error('Error deleting car model:', error);
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
                model: 'CarModel',
                ids,
                status: newStatus,
            });

            if (response.data.success) {
                setItems((prevItems) =>
                    prevItems.map((model) =>
                        ids.includes(model.id) ? { ...model, status: newStatus } : model
                    )
                );
                setInitialRecords((prevRecords) =>
                    prevRecords.map((model) =>
                        ids.includes(model.id) ? { ...model, status: newStatus } : model
                    )
                );
                setRecords((prevRecords) =>
                    prevRecords.map((model) =>
                        ids.includes(model.id) ? { ...model, status: newStatus } : model
                    )
                );

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: `Models successfully updated to ${newStatus}`,
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
        { value: '', label: 'All' }, // Default 'All' option
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
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

    // Handle status filter change
    const handleStatusChange = (
        selectedOption: { value: string; label: string } | null
    ) => {
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

                        <Link href="/model/add" className="btn btn-primary">
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
                            styles={customStyles} // Applying the styles
                        />
                    </div>
                </div>

                <div className="datatables pagination-padding">
                    {loading ? (
                        <div className="text-center p-4">Loading models...</div>
                    ) : (
                        <DataTable
                            records={records}
                            columns={[
                                { accessor: 'name', title: 'Name', sortable: true },
                                { accessor: 'slug', title: 'Slug', sortable: true },
                                { accessor: 'brand.name', title: 'Brand', sortable: true },
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
                                            <Link href={`/model/edit/${id}`} className="hover:text-info">
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

export default CarModelListingTable;
