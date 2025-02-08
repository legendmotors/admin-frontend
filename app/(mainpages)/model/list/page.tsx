import CarModelListingTable from '@/components/car/model/CarModelListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <CarModelListingTable />;
};

export default ListBrand;
