'use client';

import React from 'react';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEye from '@/components/icon/icon-eye';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import YearService from '@/services/YearService';


const YearListingTable: React.FC = () => {
    // Columns for the brand table
    const brandColumns = [
        { accessor: 'year', title: 'Year', sortable: true },
      
    ];

    // Define dynamic actions
    const actions = [
        {
            label: 'Edit',
            href: '/year/edit',
            className: 'btn btn-sm btn-info',
            icon: <IconEdit className="h-4.5 w-4.5" />,
            show: true, // Always show Edit
        },
        {
            label: 'View',
            href: '/year/view',
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
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4">Year Lists</h1>
            <ReusableTable
                modelName="Feature"
                columns={brandColumns}
                statusOptions={[
                    { value: '', label: 'All' },
                    { value: 'published', label: 'Published' },
                    { value: 'draft', label: 'Draft' },
                ]}
                listService={YearService.listYear}
                deleteService={YearService.deleteYear}
                bulkDeleteService={YearService.bulkDeleteYears}
                actions={actions}
                addUrl={"/year/add"}
            />
        </div>
    );
};

export default YearListingTable;
