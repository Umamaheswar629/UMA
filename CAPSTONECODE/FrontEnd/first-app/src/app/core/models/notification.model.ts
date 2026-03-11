export interface NotificationDto {
    id: number | string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string | Date;
}
