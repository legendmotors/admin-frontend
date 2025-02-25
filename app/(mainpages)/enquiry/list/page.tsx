import BrandListingTable from '@/components/car/brand/BrandListingTable';
import EnquiryListingComponent from '@/components/enquiry/EnquiryListingComponent';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Brand',
};

const ListBrand = () => {
    return <>
        <EnquiryListingComponent />
    </>;
};

export default ListBrand;
