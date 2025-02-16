import CarFeatureListingTable from '@/components/car/feature/CaFeatureListingTable';
import CarFeatureValueListingTable from '@/components/car/feature/CarFeatureValueListingTable';
import CarModelListingTable from '@/components/car/model/CarModelListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <CarFeatureValueListingTable />;
};

export default ListBrand;
