import apiClient from './client';
import type { JobApplication, Statistics } from '../types';

export interface CreateApplicationData {
    company: string;
    role: string;
    status: 'applied' | 'interview' | 'offer' | 'rejected' | 'accepted';
    dateApplied: string;
    notes?: string;
    salary?: string;
    location?: string;
}

export type UpdateApplicationData = Partial<CreateApplicationData>;

export const applicationsApi = {
    /**
     * Get all applications for the authenticated user
     */
    getApplications: async (): Promise<JobApplication[]> => {
        const response = await apiClient.get<JobApplication[]>('/applications');
        return response.data;
    },

    /**
     * Get a single application by ID
     */
    getApplication: async (id: string): Promise<JobApplication> => {
        const response = await apiClient.get<JobApplication>(`/applications/${id}`);
        return response.data;
    },

    /**
     * Create a new application
     */
    createApplication: async (data: CreateApplicationData): Promise<JobApplication> => {
        const response = await apiClient.post<JobApplication>('/applications', data);
        return response.data;
    },

    /**
     * Update an existing application
     */
    updateApplication: async (id: string, data: UpdateApplicationData): Promise<JobApplication> => {
        const response = await apiClient.patch<JobApplication>(`/applications/${id}`, data);
        return response.data;
    },

    /**
     * Delete an application
     */
    deleteApplication: async (id: string): Promise<void> => {
        await apiClient.delete(`/applications/${id}`);
    },

    /**
     * Get statistics for user's applications
     */
    getStatistics: async (): Promise<Statistics> => {
        const response = await apiClient.get<Statistics>('/applications/statistics');
        return response.data;
    },
};
