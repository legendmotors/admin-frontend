import AddPermissionsComponent from '@/components/users/AddPermissionsComponent';
import Breadcrumb from '@/components/utils/Breadcrumbs';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Add Brand',
};

const AddRoles = () => {
    const breadcrumbItems = [
        { label: 'Home', isHome: true, link: '/', isActive: false },
        { label: 'All Models', link: '/model/list', isActive: false },
        { label: 'Add Model', link: '', isActive: true },
    ];

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />
            <AddPermissionsComponent />

        </div>)
};

export default AddRoles;
