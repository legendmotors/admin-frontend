import BrandListingTable from '@/components/car/brand/BrandListingTable';
import ContactFormListingComponent from '@/components/contactform/ContactFormListingComponent';
import EnquiryListingComponent from '@/components/enquiry/EnquiryListingComponent';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Brand',
};

const ListBrand = () => {
    return <>
        <ContactFormListingComponent />
    </>;
};

export default ListBrand;
