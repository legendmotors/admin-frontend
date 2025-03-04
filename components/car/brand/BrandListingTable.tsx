'use client';

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import BrandService from '@/services/BrandService';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEye from '@/components/icon/icon-eye';
import ReusableTable from '@/components/common/data-table/ReusableTable';

interface BrandRow {
    id: number;
    name: string;
    slug: string;
    description: string;
    status: string;
    featured: boolean;
    logo?: {
        thumbnailPath?: string;
    };
}

const BrandListingTable: React.FC = () => {
    const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
    // Use a state to force table reload after an update
    const [reload, setReload] = useState(0);

    // Columns for the brand table
    const brandColumns = [
        {
            accessor: 'logo',
            title: 'Logo',
            render: ({ logo }: BrandRow) => {
                const imageUrl = logo?.thumbnailPath;
                return imageUrl ? (
                    <img
                        src={`${IMAGE_BASE_URL}${imageUrl}`}
                        alt="Brand Logo"
                        className="h-20 w-20 object-cover"
                    />
                ) : (
                    <div className="text-gray-400 italic">No Logo</div>
                );
            },
        },
        { accessor: 'name', title: 'Name', sortable: true },
        { accessor: 'slug', title: 'Slug', sortable: true },
        {
            accessor: 'featured',
            title: 'Featured',
            sortable: true,
            render: (rowData: BrandRow) => {
                return (
                    <label className="w-12 h-6 relative">
                        <input
                            type="checkbox"
                            className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                            checked={rowData.featured}
                            onChange={async (e) => {
                                e.stopPropagation();
                                const updatedFeatured = !rowData.featured;
                                const payload = {
                                    id: rowData.id,
                                    featured: updatedFeatured,
                                };
                                try {
                                    await BrandService.updateBrand(payload);
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Updated!',
                                        text: `Featured status updated to ${updatedFeatured ? 'Yes' : 'No'}.`,
                                    }).then(() => {
                                        // Refresh the table by updating the reload state
                                        setReload(prev => prev + 1);
                                    });
                                } catch (error) {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error',
                                        text: 'Error updating featured status',
                                    });
                                }
                            }}
                        />
                        <span className="outline_checkbox bg-icon border-2 border-gray-300 dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-gray-300 dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url('/assets/images/close.svg')] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url('/assets/images/checked.svg')] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                    </label>
                );
            },
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ status }: { status: string }) => {
                let badgeClass = '';
                switch (status) {
                    case 'published':
                        badgeClass = 'badge bg-success';
                        break;
                    case 'draft':
                        badgeClass = 'badge bg-warning';
                        break;
                    default:
                        badgeClass = 'badge bg-secondary';
                }
                return (
                    <span className={badgeClass}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            },
        },
    ];

    // Define dynamic actions (without the toggle featured action)
    const actions = [
        {
            label: 'Edit',
            href: '/brand/edit',
            className: 'btn btn-sm btn-info',
            icon: <IconEdit className="h-4.5 w-4.5" />,
            show: true,
        },
        {
            label: 'View',
            href: '/brand/view',
            className: 'btn btn-sm btn-info',
            icon: <IconEye />,
            show: false,
        },
        {
            label: 'Delete',
            icon: <IconTrashLines />,
            show: true,
        },
    ];

    const importConfig = {
        endpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/brand/import`,
        socketEvent: 'progress',
        socketURL: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}`,
        title: 'Import Brands',
        description: 'Upload a CSV file to import brands.',
        acceptedFileTypes: '.csv',
        onComplete: () => {
            console.log('Brand import completed!');
            // Additional logic if needed
        },
    };

    return (
        <div className="container mx-auto ">
            <h1 className="text-2xl font-bold mb-4">Brands Lists</h1>
            <ReusableTable
                key={reload}  // Changing this key will force the table to re-render and re-fetch data
                modelName="Brand"
                columns={brandColumns}
                statusOptions={[
                    { value: '', label: 'All' },
                    { value: 'published', label: 'Published' },
                    { value: 'draft', label: 'Draft' },
                ]}
                listService={BrandService.listBrand}
                deleteService={BrandService.deleteBrand}
                bulkDeleteService={BrandService.bulkDeleteBrands}
                actions={actions}
                importComponentConfig={importConfig}
                addUrl={"/brand/add"}
            />
        </div>
    );
};

export default BrandListingTable;
