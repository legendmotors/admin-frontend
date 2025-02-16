import PermissionListingTable from '@/components/users/PermissionListingTable';
import RolesListingTable from '@/components/users/RolesListingTable';
import UserListingTable from '@/components/users/UserListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List User',
};

const ListUser = () => {
    return <PermissionListingTable />;
};

export default ListUser;
