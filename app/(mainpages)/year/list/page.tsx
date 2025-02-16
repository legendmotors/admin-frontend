import CarFeatureListingTable from '@/components/car/feature/CaFeatureListingTable';
import CarModelListingTable from '@/components/car/model/CarModelListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <CarFeatureListingTable />;
};

export default ListBrand;
