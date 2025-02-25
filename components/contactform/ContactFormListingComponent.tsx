'use client';

import React from 'react';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEye from '@/components/icon/icon-eye';
import ContactUsService from '@/services/ContactUsService';

const ContactFormListingComponent: React.FC = () => {
    // Define columns for the contact form listing.
    const columns = [
        { accessor: 'name', title: 'Name', sortable: true },
        { accessor: 'emailAddress', title: 'Email', sortable: true },
        { accessor: 'subject', title: 'Subject', sortable: true },
        { accessor: 'createdAt', title: 'Submitted At', sortable: true },
    ];

    // Define actions for each row.
    const actions = [
        {
            label: 'View',
            href: '/contact-enquiry/view', // Route to view a single contact submission
            className: 'btn btn-sm btn-info',
            icon: <IconEye className="h-4.5 w-4.5" />,
            show: true,
        },
        {
            label: 'Delete',
            icon: <IconTrashLines className="h-4.5 w-4.5" />,
            show: true,
        },
    ];

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4">Contact Us Submissions</h1>
            <ReusableTable
                modelName="ContactUs"
                columns={columns}
                listService={ContactUsService.getContacts}
                deleteService={ContactUsService.deleteContact}
                actions={actions}
                addUrl="/contact-enquiry/add"
            />
        </div>
    );
};

export default ContactFormListingComponent;
