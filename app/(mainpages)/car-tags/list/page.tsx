import CarFeatureListingTable from '@/components/car/feature/CaFeatureListingTable';
import CarModelListingTable from '@/components/car/model/CarModelListingTable';
import CaTagListingTable from '@/components/car/tag/CaTagListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <CaTagListingTable />;
};

export default ListBrand;
