import BannerListing from '@/components/banner/BannerListing';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <BannerListing />;
};

export default ListBrand;
