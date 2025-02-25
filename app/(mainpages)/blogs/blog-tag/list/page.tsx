import BlogTagListingTable from '@/components/blog/tag/BlogTagListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <BlogTagListingTable />;
};

export default ListBrand;
