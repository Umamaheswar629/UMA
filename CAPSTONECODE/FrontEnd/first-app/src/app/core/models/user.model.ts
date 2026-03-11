export interface UserDto {
    id: number | string;
    fullName: string;
    email: string;
    role: string | number;
    isActive: boolean;
    createdAt: string | Date;
    businessName?: string;
}

export interface UpdateRoleRequest {
    userId: number | string;
    newRole: number;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
}
