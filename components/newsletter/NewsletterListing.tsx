'use client';

import React, { useState } from 'react';
import NewsletterService from '@/services/NewsletterService';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEye from '@/components/icon/icon-eye';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import Swal from 'sweetalert2';




const NewsletterListing: React.FC = () => {
    const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

    // **Toggle Subscription Status**
    const toggleStatus = async (email: string, currentStatus: string) => {

        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const result = await Swal.fire({
            title: `Change Subscription Status?`,
            text: `Are you sure you want to set this subscription as ${newStatus}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, set as ${newStatus}`,
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            await NewsletterService.unsubscribeNewsletter(email);
            Swal.fire({
                icon: 'success',
                title: `Subscription ${newStatus}!`,
                text: `The subscription has been set to ${newStatus}.`,
            }).then(() => {
                window.location.href = '/newsletter/list';
            });
        }
    };

    // Columns for the newsletter table
    const newsletterColumns = [
        { accessor: 'email', title: 'Email', sortable: true },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ status }: { status: string }) => {
                let badgeClass = '';
                switch (status) {
                    case 'active':
                        badgeClass = 'badge bg-success'; // Published -> Green
                        break;
                    case 'inactive':
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
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ email, status }: { email: string; status: string }, reloadTable: () => void) => {
                return (
                    <label className="w-12 h-6 relative flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={status === 'active'}
                            onChange={() => toggleStatus(email, status)}
                        />
                        <span className={`block w-full h-full rounded-full transition-colors duration-300 ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}>
                            <span
                                className={`absolute left-1 bottom-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${status === 'active' ? 'translate-x-6' : ''}`}
                            ></span>
                        </span>
                    </label>
                );
            },
        },
    ];

    // Define dynamic actions
    const actions = [
        {
            label: 'Edit',
            href: '/newsletter/edit',
            className: 'btn btn-sm btn-info',
            icon: <IconEdit className="h-4.5 w-4.5" />,
            show: true,
        },
        {
            label: 'View',
            href: '/newsletter/view',
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

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4">Subscription Lists</h1>
            <ReusableTable
                modelName="Newsletters"
                columns={newsletterColumns}
                statusOptions={[
                    { value: '', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                ]}
                listService={NewsletterService.getSubscribers}
                deleteService={NewsletterService.deleteSubscriber}
                actions={actions}
                addUrl={"/newsletter/add"}
            />
        </div>
    );
};

export default NewsletterListing;
