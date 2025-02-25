import BlogCategoryListingTable from '@/components/blog/category/BlogCategoryListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <BlogCategoryListingTable />;
};

export default ListBrand;
