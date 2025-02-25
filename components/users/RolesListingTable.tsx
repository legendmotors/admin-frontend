'use client';
import React from 'react';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import IconEdit from '../icon/icon-edit';
import IconPlus from '../icon/icon-plus';
import GetUserDetails from '@/services/GetUserDetails';
import Link from 'next/link';
import Select, { StylesConfig } from 'react-select';

// Status options for the dropdown filter
const statusOptions = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deleted', label: 'Deleted' },
];

const customStyles: StylesConfig<any, boolean> = {
  control: (provided) => ({
    ...provided,
    minWidth: '150px',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
};

// Define Role type (ensure it has at least an id property)
type Role = {
  id: number;
  name: string;
  description: string;
  status?: 'active' | 'inactive' | 'deleted';
  createdAt?: string;
  updatedAt?: string;
};

// Define the columns for the table
const columns = [
  { accessor: 'name', title: 'Name', sortable: true },
  { accessor: 'description', title: 'Description', sortable: false },
];

// Define row-level actions for the table.
// In this case, we only have an Edit action that links to the edit page.
const actions = [
  {
    label: 'Edit',
    href: '/users/roles/edit',
    icon: <IconEdit className="h-4.5 w-4.5" />,
  },
];

const RolesListingTable: React.FC = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Roles List</h1>
      <ReusableTable<Role>
        modelName="Role"
        columns={columns}
        statusOptions={statusOptions}
        listService={GetUserDetails.listRoles}
        actions={actions}
        addUrl="/users/roles/add"
        customStyles={customStyles}
        PAGE_SIZES={[10, 20, 30, 50, 100]}
        searchPlaceholder="Search..."
      />
    </div>
  );
};

export default RolesListingTable;
