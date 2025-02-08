import ComponentsFormsValidationCustomStyles from '@/components/car/brand/AddBrandComponent';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Invoice Add',
};

const InvoiceAdd = () => {
    return <ComponentsFormsValidationCustomStyles />
    ;
};

export default InvoiceAdd;
