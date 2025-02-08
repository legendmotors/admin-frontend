import UserListingTable from '@/components/users/UserListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List User',
};

const ListUser = () => {
    return <UserListingTable />;
};

export default ListUser;
