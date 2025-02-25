import BlogPostListingTable from '@/components/blog/post/BlogPostListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <BlogPostListingTable />;
};

export default ListBrand;
