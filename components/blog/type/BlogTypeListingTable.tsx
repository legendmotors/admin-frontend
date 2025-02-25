'use client';

import React from 'react';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import BlogTypeService from '@/services/BlogTypeService';

const BlogTypeListingTable: React.FC = () => {
  const columns = [
    { accessor: 'name', title: 'Name', sortable: true },
    { accessor: 'slug', title: 'Slug', sortable: true },
  ];

  const actions = [
    {
      label: 'Edit',
      href: '/blogs/blog-type/edit',
      className: 'btn btn-sm btn-info',
      icon: <IconEdit className="h-4.5 w-4.5" />,
      show: true,
    },
    {
      label: 'Delete',
      icon: <IconTrashLines />,
      show: true,
    },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Blog Type List</h1>
      <ReusableTable
        modelName="BlogType"
        columns={columns}
        statusOptions={[]} // Typically no status field for types
        listService={BlogTypeService.listBlogTypes}
        deleteService={BlogTypeService.deleteBlogType}
        bulkDeleteService={BlogTypeService.bulkDeleteBlogTypes}
        actions={actions}
        addUrl="/blogs/blog-type/add"
      />
    </div>
  );
};

export default BlogTypeListingTable;
