import BlogCommentListingTable from '@/components/blog/comment/BlogCommentListingTable';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <BlogCommentListingTable />;
};

export default ListBrand;
