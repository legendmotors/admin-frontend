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
import GeBrandDetails from '@/services/GeBrandDetails';

// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

type Brand = {
    id: number;
    name: string;
    slug: string;
    description: string;
    popularityScore: number;
    viewCount: number;
    carCount: number;
    featured: boolean;
    status: 'draft' | 'published';
    logo?: {
        id: string;
        name: string;
        original: string;
        thumbnail: string;
        webp: string;
        compressed: string;
        path: string;
    }[];  // ✅ Ensure logo is an array
};


const BrandListingTable: React.FC = () => {

    const { t, i18n } = getTranslation();
    const [items, setItems] = useState<Brand[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [paginationInfo, setPaginationInfo] = useState<{ totalItems: number, totalPages: number }>({ totalItems: 0, totalPages: 0 });
    const [initialRecords, setInitialRecords] = useState<Brand[]>([]);
    const [records, setRecords] = useState<Brand[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<Brand[]>([]);
    const [search, setSearch] = useState<string>('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [updating, setUpdating] = useState<boolean>(false);

    // Fetch brands from API
    useEffect(() => {
        const fetchBrands = async () => {
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
    
                const response = await GeBrandDetails.listBrand(params); // ✅ Correct API call
    
                if (!response || !response.data.length) {
                    setItems([]);
                    setInitialRecords([]);
                    setRecords([]);
                    setPaginationInfo({ totalItems: 0, totalPages: 0 });
                    return;
                }
    
                const fetchedBrands = response.data;
                setItems(fetchedBrands);
                setInitialRecords(sortBy(fetchedBrands, 'name'));
                setRecords(sortBy(fetchedBrands, 'name'));
                setPaginationInfo(response.pagination);
            } catch (error) {
                console.error('Error fetching brands:', error);
                setItems([]);
                setInitialRecords([]);
                setRecords([]);
                setPaginationInfo({ totalItems: 0, totalPages: 0 });
            } finally {
                setLoading(false);
            }
        };
    
        fetchBrands();
    }, [page, pageSize, search, sortStatus, statusFilter, i18n.language]);
    

    useEffect(() => {
        setPage(1); // Reset to page 1 when pageSize changes
    }, [pageSize]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const toggleFeatured = async (id: number, currentState: boolean) => {
        setUpdating(true);
        try {
            const response = await axios.put(`${API_BASE_URL}/brand/update`, {
                id,
                featured: !currentState,
            });

            if (response.data.success) {
                setItems((prevItems) =>
                    prevItems.map((brand) => (brand.id === id ? { ...brand, featured: !currentState } : brand))
                );
                setInitialRecords((prevRecords) =>
                    prevRecords.map((brand) => (brand.id === id ? { ...brand, featured: !currentState } : brand))
                );
                setRecords((prevRecords) =>
                    prevRecords.map((brand) => (brand.id === id ? { ...brand, featured: !currentState } : brand))
                );
            } else {
                console.error('Failed to update featured status:', response.data.message);
            }
        } catch (error) {
            console.error('Error updating featured status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const showDeleteConfirmation = (id: number | null) => {
        // If id is null and no brands are selected, it's a bulk delete attempt without selection
        if (id === null && selectedRecords.length === 0) {
            Swal.fire({
                icon: 'info', // 'info' is a valid icon type
                title: 'No Brands Selected',
                text: 'Please select at least one brand to delete.',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'sweet-alerts',  // Custom class for the popup
                },
            });
            return;
        }

        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: {
                popup: 'sweet-alerts',  // Custom class for the popup
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (id !== null) {
                        // Single delete
                        await axios.delete(`${API_BASE_URL}/brand/delete`, { params: { id } });
                        const updatedItems = items.filter((brand) => brand.id !== id);
                        setItems(updatedItems);
                        setInitialRecords(updatedItems);
                        setRecords(updatedItems);
                    } else {
                        // Bulk delete
                        const ids = selectedRecords.map((d) => d.id);
                        await axios.delete(`${API_BASE_URL}/brand/bulk-delete`, { data: { ids } });
                        const updatedItems = items.filter((brand) => !ids.includes(brand.id));
                        setItems(updatedItems);
                        setInitialRecords(updatedItems);
                        setRecords(updatedItems);
                    }
                    // Clear selection after successful delete
                    setSelectedRecords([]);
                    setSearch('');

                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Your record(s) has been deleted.',
                        icon: 'success',
                        customClass: {
                            popup: 'sweet-alerts',  // Custom class for the popup
                        },
                    });

                    // Refresh the page after deletion
                    window.location.reload();
                } catch (error) {
                    console.error('Error deleting brand:', error);
                }
            }
        });
    };


    const updateStatus = async (newStatus: 'published' | 'draft') => {
        if (selectedRecords.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No Brands Selected',
                text: 'Please select at least one brand.',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'sweet-alerts',  // Custom class for the popup
                },
            });
            return;
        }

        const ids = selectedRecords.map((brand) => brand.id);

        try {
            setUpdating(true);
            const response = await axios.post(`${API_BASE_URL}/status/bulk-update`, {
                model: 'Brand',
                ids,
                status: newStatus,
            });

            if (response.data.success) {
                setItems((prevItems) =>
                    prevItems.map((brand) =>
                        ids.includes(brand.id) ? { ...brand, status: newStatus } : brand
                    )
                );
                setInitialRecords((prevRecords) =>
                    prevRecords.map((brand) =>
                        ids.includes(brand.id) ? { ...brand, status: newStatus } : brand
                    )
                );
                setRecords((prevRecords) =>
                    prevRecords.map((brand) =>
                        ids.includes(brand.id) ? { ...brand, status: newStatus } : brand
                    )
                );

                // Show success alert
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: `Brands successfully updated to ${newStatus}`,
                    confirmButtonText: 'OK',
                    customClass: {
                        popup: 'sweet-alerts',  // Custom class for the popup
                    },
                });
            } else {
                console.error('Failed to update brand status:', response.data.message);
            }
        } catch (error) {
            console.error('Error updating brand status:', error);
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
        <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
            <div className="invoice-table">
                <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        {/* Bulk status update buttons */}
                        {selectedRecords.length > 0 && (
                            <>
                                {selectedRecords.every((brand) => brand.status === 'draft') && (
                                    <button
                                        type="button"
                                        className="btn btn-success gap-2"
                                        onClick={() => updateStatus('published')}
                                    >
                                        Publish
                                    </button>
                                )}
                                {selectedRecords.every((brand) => brand.status === 'published') && (
                                    <button
                                        type="button"
                                        className="btn btn-warning gap-2"
                                        onClick={() => updateStatus('draft')}
                                    >
                                        Unpublish
                                    </button>
                                )}
                                {selectedRecords.some((brand) => brand.status === 'draft') &&
                                    selectedRecords.some((brand) => brand.status === 'published') && (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-success gap-2"
                                                onClick={() => updateStatus('published')}
                                            >
                                                Publish
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-warning gap-2"
                                                onClick={() => updateStatus('draft')}
                                            >
                                                Unpublish
                                            </button>
                                        </>
                                    )}
                            </>
                        )}

                        {/* Bulk delete button */}
                        <button
                            type="button"
                            className="btn btn-danger gap-2"
                            onClick={() => showDeleteConfirmation(null)}
                        >
                            <IconTrashLines />
                            Delete
                        </button>

                        {/* Add New Brand */}
                        <Link href="/brand/add" className="btn btn-primary gap-2">
                            <IconPlus />
                            Add New
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
                        <div className="text-center p-4">Loading brands...</div>
                    ) : (
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={records}
                            columns={[
                                {
                                    accessor: 'logo',
                                    title: 'Logo',
                                    sortable: false,
                                    render: ({ logo }) => {
                                        // Ensure logo is an array and has at least one item
                                        const imageUrl = Array.isArray(logo) && logo.length > 0 ? logo[0].thumbnail || logo[0].original : null;

                                        return imageUrl ? (
                                            <img
                                                src={`${IMAGE_BASE_URL}${imageUrl}`} // Ensure BASE_URL is used
                                                alt="Brand Logo"
                                                className="h-20 w-20  object-cover"
                                            />
                                        ) : (
                                            <div className="text-gray-400 italic">No Logo</div>
                                        );
                                    },
                                }
                                ,
                                {
                                    accessor: 'name',
                                    title: 'Name',
                                    sortable: true
                                },
                                {
                                    accessor: 'slug',
                                    title: 'Slug',
                                    sortable: true,
                                },
                                {
                                    accessor: 'description',
                                    title: 'Description',
                                    sortable: false,
                                },
                                // {
                                //     accessor: 'popularityScore',
                                //     title: 'Popularity Score',
                                //     sortable: true,
                                // },
                                // {
                                //     accessor: 'viewCount',
                                //     title: 'View Count',
                                //     sortable: true,
                                // },
                                // {
                                //     accessor: 'carCount',
                                //     title: 'Car Count',
                                //     sortable: true,
                                // },
                                {
                                    accessor: 'featured',
                                    title: 'Featured',
                                    sortable: false,
                                    render: ({ id, featured }) => (
                                        <label className="w-12 h-6 relative">
                                            <input
                                                type="checkbox"
                                                className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                                id={`custom_switch_checkbox_${id}`}
                                                checked={featured}
                                                onChange={() => toggleFeatured(id, featured)}
                                            />
                                            <span
                                                className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full 
                          before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark 
                          before:bottom-1 before:w-4 before:h-4 before:rounded-full 
                          before:bg-[url('/assets/images/close.svg')] before:bg-no-repeat before:bg-center 
                          peer-checked:before:left-7 peer-checked:before:bg-[url('/assets/images/checked.svg')] 
                          peer-checked:border-primary peer-checked:before:bg-primary 
                          before:transition-all before:duration-300"
                                            ></span>
                                        </label>
                                    ),
                                },
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
                                    sortable: false,
                                    textAlignment: 'center',
                                    render: ({ id }) => (
                                        <div className="mx-auto flex w-max items-center gap-4">
                                            <Link href={`/brand/edit/${id}`} className="flex hover:text-info">
                                                <IconEdit className="h-4.5 w-4.5" />
                                            </Link>
                                            {/* <Link href={`/brand/view?id=${id}`} className="flex hover:text-primary">
                                                <IconEye className="h-4.5 w-4.5" />
                                            </Link> */}
                                            <button
                                                type="button"
                                                className="flex hover:text-danger"
                                                onClick={() => showDeleteConfirmation(id)}
                                            >
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

export default BrandListingTable;
