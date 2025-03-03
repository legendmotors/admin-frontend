'use client';

import React from 'react';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEye from '@/components/icon/icon-eye';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import PartnerService from '@/services/PartnerService';

interface BrandRow {
    id: number;
    name: string;
    slug: string;
    description: string;
    status: string;
    media?: {
        thumbnailPath?: string;
        // add any other fields you expect, e.g. originalPath, etc.
    };
}

const PartnerListing: React.FC = () => {
    const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

    // Columns for the brand table
    const brandColumns = [
        {
            accessor: 'media',
            title: 'Media',
            render: ({ media }: BrandRow) => {
                const imageUrl = media?.thumbnailPath;
                return imageUrl ? (
                    <img
                        src={`${IMAGE_BASE_URL}${imageUrl}`}
                        alt="Brand Logo"
                        className="h-20 w-20 object-contain"
                    />
                ) : (
                    <div className="text-gray-400 italic">No Logo</div>
                );
            },
        },
        { accessor: 'name', title: 'Name', sortable: true },
        { accessor: 'order', title: 'Order', sortable: true }
        // {
        //     accessor: 'status',
        //     title: 'Status',
        //     sortable: true,
        //     render: ({ status }: { status: string }) => {
        //         let badgeClass = '';
        //         switch (status) {
        //             case 'published':
        //                 badgeClass = 'badge bg-success'; // Published -> Green
        //                 break;
        //             case 'draft':
        //                 badgeClass = 'badge bg-warning'; // Draft -> Yellow
        //                 break;
        //             default:
        //                 badgeClass = 'badge bg-secondary'; // Default -> Grey
        //         }
        //         return (
        //             <span className={badgeClass}>
        //                 {status.charAt(0).toUpperCase() + status.slice(1)}
        //             </span>
        //         );
        //     },
        // },
    ];

    // Define dynamic actions
    const actions = [
        {
            label: 'Edit',
            href: '/partners/edit',
            className: 'btn btn-sm btn-info',
            icon: <IconEdit className="h-4.5 w-4.5" />,
            show: true, // Always show Edit
        },
        {
            label: 'View',
            href: '/partners/view',
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


    return (
        <div className="container mx-auto ">
            <h1 className="text-2xl font-bold mb-4">Partner Lists</h1>
            <ReusableTable
                modelName="Banner"
                columns={brandColumns}
                statusOptions={[
                    { value: '', label: 'All' },
                    { value: 'published', label: 'Published' },
                    { value: 'draft', label: 'Draft' },
                ]}
                listService={PartnerService.listPartnerLogos}
                deleteService={PartnerService.deletePartnerLogo}
                bulkDeleteService={PartnerService.bulkDeletePartnerLogos}
                actions={actions}
                addUrl={"/partners/add"}
            />
        </div>
    );
};

export default PartnerListing;
