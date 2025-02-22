'use client';

import React from 'react';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEye from '@/components/icon/icon-eye';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import CarTagService from '@/services/CarTagService';


const CaTagListingTable: React.FC = () => {
    // Columns for the brand table
    const brandColumns = [
        { accessor: 'name', title: 'Name', sortable: true },
        { accessor: 'key', title: 'Slug', sortable: true },
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
            href: '/car-tags/edit',
            className: 'btn btn-sm btn-info',
            icon: <IconEdit className="h-4.5 w-4.5" />,
            show: true, // Always show Edit
        },
        {
            label: 'View',
            href: '/car-tags/view',
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
        endpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/trim/import`,
        socketEvent: 'progress',
        socketURL: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}`,
        title: 'Import Trims',
        description: 'Upload a CSV file to import Trims.',
        acceptedFileTypes: '.csv',
        onComplete: () => {
            console.log('Trim import completed!');
            // Additional logic if needed
        },
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4">Parent Feature Lists</h1>
            <ReusableTable
                modelName="Feature"
                columns={brandColumns}
                statusOptions={[
                    { value: '', label: 'All' },
                    { value: 'published', label: 'Published' },
                    { value: 'draft', label: 'Draft' },
                ]}
                listService={CarTagService.listTags}
                deleteService={CarTagService.deleteTag}
                bulkDeleteService={CarTagService.bulkDeleteTags}
                actions={actions}
                addUrl={"/car-tags/add"}
            />
        </div>
    );
};

export default CaTagListingTable;
