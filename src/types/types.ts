export interface User {
    id: number;
    name: string;
    email: string;
}


export interface UserArray {
    users: User[];
}

export interface ScheduleItem {
    id: string;
    jobId: string;
    userId: string;
    date: string; // ISO date
    status: number | string;
    jobTitle?: string;
    jobName?: string;
    userFirstName?: string;
    userLastName?: string;
    firstName?: string;
    lastName?: string;
    statusName?: string;
}

export interface ScheduleResponse {
    items: ScheduleItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}
