import CarInventoryListing from '@/components/car/carinventory/CarInventoryListing';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Brand',
};

const ListBrand = () => {
    return <CarInventoryListing />;
};

export default ListBrand;
