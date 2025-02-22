'use client';

import React from 'react';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEye from '@/components/icon/icon-eye';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import SpecificationService from '@/services/SpecificationService';

const CarSpecificationListingTable: React.FC = () => {
    // Columns for the brand table
    const brandColumns = [
        { accessor: 'name', title: 'Name', sortable: true },
        { accessor: 'key', title: 'Slug', sortable: true },
        {
            accessor: 'mandatory',
            title: 'Mandatory',
            sortable: true,
            render: ({ mandatory }: { mandatory: boolean }) => {
                const badgeClass = mandatory ? 'badge bg-success' : 'badge bg-danger';
                return (
                    <span className={badgeClass}>
                        {mandatory ? 'Yes' : 'No'}
                    </span>
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
            href: '/specification/edit',
            className: 'btn btn-sm btn-info',
            icon: <IconEdit className="h-4.5 w-4.5" />,
            show: true, // Always show Edit
        },
        {
            label: 'View',
            href: '/specification/view',
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
        endpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/featurevalue/import`,
        socketEvent: 'progress',
        socketURL: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}`,
        title: 'Import Features With Values',
        description: 'Upload a CSV file to import Features with values..',
        acceptedFileTypes: '.csv',
        onComplete: () => {
            console.log('Features import completed!');
            // Additional logic if needed
        },
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4">Parent Specification Lists</h1>
            <ReusableTable
                modelName="Specification"
                columns={brandColumns}
                statusOptions={[
                    { value: '', label: 'All' },
                    { value: 'published', label: 'Published' },
                    { value: 'draft', label: 'Draft' },
                ]}
                listService={SpecificationService.listSpecifications}
                deleteService={SpecificationService.deleteSpecification}
                bulkDeleteService={SpecificationService.bulkDeleteSpecifications}
                actions={actions}
                addUrl={"/specification/add"}
            />
        </div>
    );
};

export default CarSpecificationListingTable;
