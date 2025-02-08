import BrandListingTable from '@/components/car/brand/BrandListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Brand',
};

const ListBrand = () => {
    return <BrandListingTable />;
};

export default ListBrand;
