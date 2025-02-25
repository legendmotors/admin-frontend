import BannerListing from '@/components/banner/BannerListing';
import NewsletterListing from '@/components/newsletter/NewsletterListing';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};

const ListBrand = () => {
    return <NewsletterListing />;
};

export default ListBrand;
