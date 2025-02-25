import PageListingComponent from '@/components/cms/PageListingComponent';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <PageListingComponent />;
};

export default ListBrand;
