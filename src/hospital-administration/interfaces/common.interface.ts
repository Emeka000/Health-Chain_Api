export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface FilterQuery extends PaginationQuery {
  search?: string;
  status?: string;
  departmentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalPatients: number;
  occupiedBeds: number;
  totalBeds: number;
  occupancyRate: number;
  totalStaff: number;
  activeStaff: number;
  totalRevenue: number;
  pendingBills: number;
}

export interface ReportFilter {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate?: Date;
  endDate?: Date;
  departmentId?: string;
  staffId?: string;
}
