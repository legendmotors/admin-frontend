'use client';

import React from 'react';
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
    logo?: {
        thumbnailPath?: string;
        // add any other fields you expect, e.g. originalPath, etc.
    };
}

const BrandListingTable: React.FC = () => {
    const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

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
        { accessor: 'description', title: 'Description', sortable: false },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ status }: { status: string }) => {
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
    ];

    // Define dynamic actions
    const actions = [
        {
            label: 'Edit',
            href: '/brand/edit',
            className: 'btn btn-sm btn-info',
            icon: <IconEdit className="h-4.5 w-4.5" />,
            show: true, // Always show Edit
        },
        {
            label: 'View',
            href: '/brand/view',
            className: 'btn btn-sm btn-info',
            icon: <IconEye />,
            show: false, // Always show Edit
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
