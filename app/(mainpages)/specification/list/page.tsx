import CarSpecificationListingTable from '@/components/car/specification/CarSpecificationListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <CarSpecificationListingTable />;
};

export default ListBrand;
