"use client"
import { useEffect, useState, useRef } from "react";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { 
  Plus, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Search, 
  Calendar, 
  Copy, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Ban,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { toast } from "react-toastify";

type TenantApiItem = {
    id: string;
    accountId: string;
    name: string;
    phone: string;
    taxNumber: string;
    bankName: string;
    cardNumber: string;
    status: string;
    planName: string;
    totalRestaurants: number;
    totalDishes: number;
    totalCategories: number;
    checked?: boolean;
};

type TenantApiResponse = {
    isSuccess: boolean;
    message: string;
    data: TenantApiItem[];
    errors: unknown[];
    timestamp: string;
};

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState<TenantApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await apiClient.get<TenantApiResponse>(API.TENANT.GET_ALL);
        if (response.status === 200 && response.data.isSuccess) {
          setTenants(response.data.data);
        } 
      } catch (error) {
        console.error("Error fetching tenants:", error);
        setTenants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  },[]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  //Block Tenant
  const blockTenant = async (tenantId: string) => {
    try {
      const response = await apiClient.post(API.TENANT.BLOCK_TENANT(tenantId));
      if (response.status === 200) {
        setTenants(prevTenants => 
          prevTenants.map(tenant => 
            tenant.id === tenantId ? { ...tenant, status: 'False' } : tenant
          )
        );
        toast.success("Tenant blocked successfully");
        setOpenDropdownId(null);
      } else {
        toast.error("Failed to block tenant");
      }
    } catch (error) {
      console.error("Error blocking tenant:", error);
      toast.error("Error blocking tenant");
    }
  };

  // Toggle dropdown
  const toggleDropdown = (tenantId: string) => {
    setOpenDropdownId(openDropdownId === tenantId ? null : tenantId);
  };

  // Filter tenants based on search
  const filteredTenants = tenants.filter(tenant => 
    tenant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.accountId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.phone.includes(searchQuery)
  );

  // Pagination
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTenants = filteredTenants.slice(startIndex, startIndex + itemsPerPage);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Handle individual checkbox
  const handleTenantCheckboxChange = (tenantId: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(tenantId);
      } else {
        newSet.delete(tenantId);
      }
      return newSet;
    });
  };

  // Handle "Select All" checkbox
  const checkAllCheckBox = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedTenants.map(tenant => tenant.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  // Check if all current page items are selected
  const isAllSelected = paginatedTenants.length > 0 && 
    paginatedTenants.every(tenant => selectedIds.has(tenant.id));

  // Check if some (but not all) items are selected
  const isSomeSelected = paginatedTenants.some(tenant => selectedIds.has(tenant.id)) && !isAllSelected;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Tenant Management</h1>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Plus className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <SlidersHorizontal className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowUpDown className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mx-6 my-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="w-12 px-4 py-3">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300" 
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => checkAllCheckBox(e.target.checked)} 
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : paginatedTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No tenants found
                  </td>
                </tr>
              ) : (
                paginatedTenants.map((tenant, index) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedIds.has(tenant.id)}
                        onChange={(e) => handleTenantCheckboxChange(tenant.id, e.target.checked)} 
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      #{tenant.accountId.slice(0, 7).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                          {tenant.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      user{index + 1}@gmail.com
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{tenant.phone}</span>
                        <button 
                          onClick={() => copyToClipboard(tenant.phone)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const status = tenant.status?.toLowerCase() || ''; 
                        const isActive = status === 'true' || status === 'active';
                        return isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50">
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50">
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            Inactive
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative" ref={openDropdownId === tenant.id ? dropdownRef : null}>
                        <button 
                          onClick={() => toggleDropdown(tenant.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdownId === tenant.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => {
                                // View detail logic
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                // Edit logic
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => blockTenant(tenant.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Ban className="w-4 h-4" />
                              Block Tenant
                            </button>
                            <button
                              onClick={() => {
                                // Delete logic
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-center gap-1">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`min-w-[32px] px-2 py-1.5 text-sm rounded transition-colors ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}
