'use client';

import React, { useEffect, useState } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { sortBy } from 'lodash';
import Select from 'react-select';
import { StylesConfig } from 'react-select';
import Swal from 'sweetalert2';
import axios from 'axios';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import Link from 'next/link';
import IconPlus from '@/components/icon/icon-plus';
import ImportComponent from '@/components/utils/ImportComponent';
import { format } from 'date-fns';
import UpdateStatusService from '@/services/UpdateStatusService';

type ImportComponentConfig = {
  endpoint: string;
  socketEvent: string;
  socketURL: string;
  title: string;
  description: string;
  acceptedFileTypes: string;
  onComplete: () => void;
};

type TableProps<T> = {
  listService: (params: Record<string, any>) => Promise<{ data: T[]; pagination: { totalItems: number; totalPages: number } }>;
  deleteService: (id: number) => Promise<boolean>; // Change from void to boolean
  bulkDeleteService: (ids: number[]) => Promise<boolean>; columns: any[];
  actions?: { label: string; show?: boolean; href?: string; onClick?: (id: number) => void; className?: string; icon?: React.ReactNode; }[];
  PAGE_SIZES?: number[];
  searchPlaceholder?: string;
  statusOptions?: { value: string; label: string }[];
  customStyles?: StylesConfig<any, boolean>;
  modelName: string;
  importComponentConfig?: ImportComponentConfig;
  addUrl?: string;
};

const ReusableTable = <T extends Record<string, any>>({
  columns,
  actions = [],
  PAGE_SIZES = [10, 20, 30, 50, 100],
  searchPlaceholder = 'Search...',
  statusOptions,
  modelName,
  listService,
  deleteService,
  bulkDeleteService,
  importComponentConfig,
  addUrl
}: TableProps<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [paginationInfo, setPaginationInfo] = useState<{ totalItems: number; totalPages: number }>({
    totalItems: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState<string>('');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'id',
    direction: 'desc',
  });
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<T[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchDataFromAPI = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page,
          limit: pageSize,
          sortBy: sortStatus.columnAccessor,
          order: sortStatus.direction.toUpperCase(),
        };

        if (search.trim()) params.search = search.trim();
        if (statusFilter) params.status = statusFilter;

        const response = await listService(params);

        setItems(sortBy(response.data, 'name')); // Sort by name by default
        setPaginationInfo(response.pagination);
      } catch (error) {
        console.error('Error fetching data:', error);
        setItems([]);
        setPaginationInfo({ totalItems: 0, totalPages: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromAPI();
  }, [page, pageSize, search, sortStatus, statusFilter]);

  useEffect(() => {
    setPage(1); // Reset to page 1 when pageSize changes
  }, [pageSize]);

  const handleStatusChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    setStatusFilter(selectedOption?.value || null);
  };

  const updateStatus = async (newStatus: 'published' | 'draft') => {
    if (selectedRecords.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Items Selected',
        text: 'Please select at least one item.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const ids = selectedRecords.map((item) => item.id);

    try {
      setUpdating(true);

      // Call the service for bulk updating status
      const success = await UpdateStatusService.bulkUpdateStatus({
        model: modelName,
        ids,
        status: newStatus,
      });

      if (success) {
        // Update the items with the new status
        setItems((prevItems) =>
          prevItems.map((item) =>
            ids.includes(item.id) ? { ...item, status: newStatus } : item
          )
        );

        // Clear the selected records
        setSelectedRecords([]); // Clear selected records after the update

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Items successfully updated to ${newStatus}`,
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: `Failed to update items to ${newStatus}`,
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating the item status.',
        confirmButtonText: 'OK',
      });
    } finally {
      setUpdating(false);
    }
  };


  const showDeleteConfirmation = (id: number | null) => {
    if (id === null && selectedRecords.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Items Selected',
        text: 'Please select at least one item to delete.',
        confirmButtonText: 'OK',
      });
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: 'Delete',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (id !== null) {
            // Single delete
            await deleteService(id);
            setItems((prevItems) => prevItems.filter((item) => item.id !== id));
          } else {
            // Bulk delete
            const ids = selectedRecords.map((item) => item.id);
            await bulkDeleteService(ids);
            setItems((prevItems) => prevItems.filter((item) => !ids.includes(item.id)));
            setSelectedRecords([]);
          }
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      }
    });
  };

  const handleImportComplete = () => {
    console.log("Import completed! Refreshing data...");
  };

  const customStyles: StylesConfig<any, boolean> = {
    control: (provided) => ({
      ...provided,
      minWidth: '150px',  // Adjust width as needed
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,  // Increase z-index to ensure dropdown is on top
    }),
  };


  const handleDelete = (id: number | null) => {

    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: 'Delete',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (id !== null) {
            // Single delete
            await deleteService(id);
            setItems((prevItems) => prevItems.filter((item) => item.id !== id));
          }

        } catch (error) {
          console.error('Error deleting item:', error);
        }
      }
    });
  };


  const renderActions = (id: number) => (
    <div className="flex gap-2">
      {actions
        .filter((action) => action.show !== false) // Only render actions where `show` is not explicitly false
        .map((action, index) =>
          action.href ? (
            <a key={index} href={`${action.href}/${id}`} className={action.className || 'btn btn-sm btn-primary'}>
              {action.icon} {action.label}
            </a>
          ) : action.label === 'Delete' ? (
            <button
              key={index}
              onClick={() => handleDelete(id)} // Delete logic remains in the ReusableTable
              className={action.className || 'btn btn-sm btn-danger'}
            >
              {action.icon} {action.label}
            </button>
          ) : (
            <button
              key={index}
              onClick={() => action.onClick && action.onClick(id)} // Other dynamic actions
              className={action.className || 'btn btn-sm btn-primary'}
            >
              {action.label}
            </button>
          )
        )}
    </div>
  );

  return (
    <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
      <div className="invoice-table">
        <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            {/* Bulk status update buttons */}
            {selectedRecords.length > 0 && (
              <>
                {selectedRecords.every((brand) => brand.status === 'draft') && (
                  <button
                    type="button"
                    className="btn btn-success gap-2"
                    onClick={() => updateStatus('published')}
                  >
                    Publish
                  </button>
                )}
                {selectedRecords.every((brand) => brand.status === 'published') && (
                  <button
                    type="button"
                    className="btn btn-warning gap-2"
                    onClick={() => updateStatus('draft')}
                  >
                    Unpublish
                  </button>
                )}
                {selectedRecords.some((brand) => brand.status === 'draft') &&
                  selectedRecords.some((brand) => brand.status === 'published') && (
                    <>
                      <button
                        type="button"
                        className="btn btn-success gap-2"
                        onClick={() => updateStatus('published')}
                      >
                        Publish
                      </button>
                      <button
                        type="button"
                        className="btn btn-warning gap-2"
                        onClick={() => updateStatus('draft')}
                      >
                        Unpublish
                      </button>
                    </>
                  )}
              </>
            )}

            {/* Bulk delete button */}
            <button
              type="button"
              className="btn btn-danger gap-2"
              onClick={() => showDeleteConfirmation(null)}
            >
              <IconTrashLines />
              Delete
            </button>

            {addUrl ? (
              <Link href={addUrl} className="btn btn-primary gap-2">
                <IconPlus />
                Add New
              </Link>
            ) : (
              <button className="btn btn-primary gap-2" disabled>
                <IconPlus />
                Add New
              </button>
            )}


          </div>
          <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
            {importComponentConfig && (
              <ImportComponent
                endpoint={importComponentConfig.endpoint}
                socketEvent={importComponentConfig.socketEvent}
                socketURL={importComponentConfig.socketURL}
                title={importComponentConfig.title}
                description={importComponentConfig.description}
                acceptedFileTypes={importComponentConfig.acceptedFileTypes}
                onComplete={importComponentConfig.onComplete || handleImportComplete}
              />
            )}
            <input
              type="text"
              className="form-input w-auto"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              options={statusOptions}
              value={(statusOptions || []).find((option) => option.value === (statusFilter || ''))}
              onChange={handleStatusChange}
              isSearchable={false}
              placeholder="Select Status"
              className="w-auto"
              styles={customStyles} // Applying the styles
            />
          </div>

        </div>

        <div className="datatables pagination-padding">
          {loading ? (
            <div className="text-center p-4">Loading data...</div>
          ) : (
            <DataTable
              records={items}
              columns={[
                { accessor: 'id', title: 'ID', sortable: true },
                ...columns,
                {
                  accessor: 'createdAt',
                  title: 'Created At',
                  sortable: true,
                  render: ({ createdAt }: { createdAt: string }) => format(new Date(createdAt), 'dd MMM yyyy HH:mm:ss'), // e.g., 15 Feb 2025 06:07:51
                },
                {
                  accessor: 'updatedAt',
                  title: 'Updated At',
                  sortable: true,
                  render: ({ updatedAt }: { updatedAt: string }) => format(new Date(updatedAt), 'dd MMM yyyy HH:mm:ss'), // e.g., 15 Feb 2025 06:07:51
                },
                {
                  accessor: 'action',
                  title: 'Actions',
                  sortable: false,
                  render: ({ id }: { id: number }) => renderActions(id),
                },

              ]}
              highlightOnHover
              totalRecords={paginationInfo.totalItems}
              recordsPerPage={pageSize}
              page={page}
              onPageChange={setPage}
              recordsPerPageOptions={PAGE_SIZES}
              onRecordsPerPageChange={setPageSize}
              sortStatus={sortStatus}
              onSortStatusChange={setSortStatus}
              selectedRecords={selectedRecords}
              onSelectedRecordsChange={setSelectedRecords}
              paginationText={({ from, to, totalRecords }) =>
                `Showing ${from} to ${to} of ${totalRecords} entries`
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReusableTable;
