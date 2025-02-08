import TrimsListingTable from '@/components/car/trim/TrimsListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Brand',
};

const ListBrand = () => {
    return <TrimsListingTable />;
};

export default ListBrand;
