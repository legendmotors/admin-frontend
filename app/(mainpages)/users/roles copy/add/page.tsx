import AddRolesComponent from '@/components/users/AddRolesComponent';
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
            <AddRolesComponent />

        </div>)
};

export default AddRoles;
