'use client';

import React from 'react';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEye from '@/components/icon/icon-eye';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import BlogService from '@/services/BlogService';

const BlogPostListingTable: React.FC = () => {
  const columns = [
    { accessor: 'title', title: 'Title', sortable: true },
    { accessor: 'slug', title: 'Slug', sortable: true },
    {
      accessor: 'status',
      title: 'Status',
      sortable: true,
      render: ({ status }: { status: string }) => {
        let badgeClass = '';
        switch (status) {
          case 'published':
            badgeClass = 'badge bg-success';
            break;
          case 'draft':
            badgeClass = 'badge bg-warning';
            break;
          default:
            badgeClass = 'badge bg-secondary';
        }
        return (
          <span className={badgeClass}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    { accessor: 'publishedAt', title: 'Published At', sortable: true },
    { accessor: 'viewCount', title: 'Views', sortable: true },
  ];

  const actions = [
    {
      label: 'Edit',
      href: '/blogs/blog-post/edit',
      className: 'btn btn-sm btn-info',
      icon: <IconEdit className="h-4.5 w-4.5" />,
      show: true,
    },
    {
      label: 'View',
      href: '/blogs/blog-post/view',
      className: 'btn btn-sm btn-info',
      icon: <IconEye />,
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
      <h1 className="text-2xl font-bold mb-4">Blog Post List</h1>
      <ReusableTable
        modelName="BlogPost"
        columns={columns}
        statusOptions={[
          { value: '', label: 'All' },
          { value: 'published', label: 'Published' },
          { value: 'draft', label: 'Draft' },
        ]}
        listService={BlogService.listBlogPosts}
        deleteService={BlogService.deleteBlogPost}
        bulkDeleteService={BlogService.bulkDeleteBlogPosts}
        actions={actions}
        addUrl="/blogs/blog-post/add"
      />
    </div>
  );
};

export default BlogPostListingTable;
