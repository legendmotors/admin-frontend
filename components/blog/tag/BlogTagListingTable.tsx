'use client';

import React from 'react';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import BlogTagService from '@/services/BlogTagService';

const BlogTagListingTable: React.FC = () => {
  const columns = [
    { accessor: 'name', title: 'Name', sortable: true },
    { accessor: 'slug', title: 'Slug', sortable: true },
  ];

  const actions = [
    {
      label: 'Edit',
      href: '/blogs/blog-tag/edit',
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
      <h1 className="text-2xl font-bold mb-4">Blog Tag List</h1>
      <ReusableTable
        modelName="BlogTag"
        columns={columns}
        statusOptions={[]} // Typically tags don't have a status field
        listService={BlogTagService.listBlogTags}
        deleteService={BlogTagService.deleteBlogTag}
        bulkDeleteService={BlogTagService.bulkDeleteBlogTags}
        actions={actions}
        addUrl="/blogs/blog-tag/add"
      />
    </div>
  );
};

export default BlogTagListingTable;
