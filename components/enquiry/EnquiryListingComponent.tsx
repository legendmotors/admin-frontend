'use client';

import React from 'react';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEye from '@/components/icon/icon-eye';
import CarEnquiryService from '@/services/CarEnquiryService';

const EnquiryListingComponent: React.FC = () => {
  // Define columns for the enquiry table
  const columns = [
    { accessor: 'stockId', title: 'Stock ID', sortable: true },
    { accessor: 'year', title: 'Year', sortable: true },
    { accessor: 'brand', title: 'Brand', sortable: true },
    { accessor: 'model', title: 'Model', sortable: true },
    { accessor: 'trim', title: 'Trim', sortable: true },
    { accessor: 'name', title: 'Name', sortable: true },
    { accessor: 'emailAddress', title: 'Email', sortable: true },
    // Optionally include phone number and createdAt
    { accessor: 'phoneNumber', title: 'Phone', sortable: false },
    { accessor: 'createdAt', title: 'Subscribed At', sortable: true },
  ];

  // Define actions for each row
  const actions = [
    {
      label: 'View',
      href: '/enquiry/view', // Route to view enquiry details
      className: 'btn btn-sm btn-info',
      icon: <IconEye className="h-4.5 w-4.5" />,
      show: true,
    },
    {
      label: 'Delete',
      icon: <IconTrashLines className="h-4.5 w-4.5" />,
      show: true,
    },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Car Enquiries</h1>
      <ReusableTable
        modelName="CarEnquiries"
        columns={columns}
        listService={CarEnquiryService.getCarEnquiries}
        deleteService={CarEnquiryService.deleteCarEnquiry}
        actions={actions}
        addUrl="/enquiry/add"
      />
    </div>
  );
};

export default EnquiryListingComponent;
