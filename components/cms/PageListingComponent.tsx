'use client';

import React from 'react';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEye from '@/components/icon/icon-eye';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import PagesService from '@/services/PagesService';
import IconMenuScrumboard from '../icon/menu/icon-menu-scrumboard';
import IconListCheck from '../icon/icon-list-check';

const PageListingComponent: React.FC = () => {
    // Columns for the brand table
    const brandColumns = [
        { accessor: 'title', title: 'Name', sortable: true },
        { accessor: 'slug', title: 'Slug', sortable: true },

    ];

    // Define dynamic actions
    const actions = [
        {
            label: 'Edit',
            href: '/page/edit',
            className: 'btn btn-sm btn-info',
            icon: <IconEdit className="h-4.5 w-4.5" />,
            show: true, // Always show Edit
        },
        {
            label: 'Sections',
            href: '/page-section/list',
            className: 'btn btn-sm btn-info',
            icon: <IconListCheck className="h-4.5 w-4.5" />,
            show: true, // Always show Edit
        },
        {
            label: 'View',
            href: '/page/view',
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
            <h1 className="text-2xl font-bold mb-4">Page Lists</h1>
            <ReusableTable
                modelName="Feature"
                columns={brandColumns}
                statusOptions={[]}
                listService={PagesService.listPages}
                deleteService={PagesService.deletePage}
                bulkDeleteService={PagesService.bulkDeletePages}
                actions={actions}
                addUrl={"/page/add"}
            />
        </div>
    );
};

export default PageListingComponent;
