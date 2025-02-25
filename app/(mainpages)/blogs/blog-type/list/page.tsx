import BlogTypeListingTable from '@/components/blog/type/BlogTypeListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <BlogTypeListingTable />;
};

export default ListBrand;
