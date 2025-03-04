import CarFeatureListingTable from '@/components/car/feature/CaFeatureListingTable';
import CarModelListingTable from '@/components/car/model/CarModelListingTable';
import YearListingTable from '@/components/car/year/YearListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <YearListingTable />;
};

export default ListBrand;
