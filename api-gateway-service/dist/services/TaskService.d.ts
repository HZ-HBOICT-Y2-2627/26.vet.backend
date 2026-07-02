import { TaskInput, TaskUpdateInput } from '../types';
export declare class TaskService {
    getAllTasks(filters?: {
        projectId?: number;
        tagId?: number;
        priority?: number;
        status?: number;
    }): Promise<({
        project: {
            id: number;
            title: string;
            description: string | null;
        } | null;
        tags: ({
            tag: {
                id: number;
                title: string;
            };
        } & {
            tagId: number;
            taskId: number;
        })[];
    } & {
        id: number;
        title: string;
        description: string | null;
        priority: number;
        status: number;
        progress: number;
        createdAt: Date;
        completedAt: Date | null;
        projectId: number | null;
    })[]>;
    getTaskById(id: number): Promise<({
        project: {
            id: number;
            title: string;
            description: string | null;
        } | null;
        tags: ({
            tag: {
                id: number;
                title: string;
            };
        } & {
            tagId: number;
            taskId: number;
        })[];
    } & {
        id: number;
        title: string;
        description: string | null;
        priority: number;
        status: number;
        progress: number;
        createdAt: Date;
        completedAt: Date | null;
        projectId: number | null;
    }) | null>;
    createTask(input: TaskInput): Promise<{
        project: {
            id: number;
            title: string;
            description: string | null;
        } | null;
        tags: ({
            tag: {
                id: number;
                title: string;
            };
        } & {
            tagId: number;
            taskId: number;
        })[];
    } & {
        id: number;
        title: string;
        description: string | null;
        priority: number;
        status: number;
        progress: number;
        createdAt: Date;
        completedAt: Date | null;
        projectId: number | null;
    }>;
    updateTask(id: number, input: TaskUpdateInput): Promise<{
        project: {
            id: number;
            title: string;
            description: string | null;
        } | null;
        tags: ({
            tag: {
                id: number;
                title: string;
            };
        } & {
            tagId: number;
            taskId: number;
        })[];
    } & {
        id: number;
        title: string;
        description: string | null;
        priority: number;
        status: number;
        progress: number;
        createdAt: Date;
        completedAt: Date | null;
        projectId: number | null;
    }>;
    deleteTask(id: number): Promise<boolean>;
    addTagToTask(taskId: number, tagId: number): Promise<({
        project: {
            id: number;
            title: string;
            description: string | null;
        } | null;
        tags: ({
            tag: {
                id: number;
                title: string;
            };
        } & {
            tagId: number;
            taskId: number;
        })[];
    } & {
        id: number;
        title: string;
        description: string | null;
        priority: number;
        status: number;
        progress: number;
        createdAt: Date;
        completedAt: Date | null;
        projectId: number | null;
    }) | null>;
    removeTagFromTask(taskId: number, tagId: number): Promise<({
        project: {
            id: number;
            title: string;
            description: string | null;
        } | null;
        tags: ({
            tag: {
                id: number;
                title: string;
            };
        } & {
            tagId: number;
            taskId: number;
        })[];
    } & {
        id: number;
        title: string;
        description: string | null;
        priority: number;
        status: number;
        progress: number;
        createdAt: Date;
        completedAt: Date | null;
        projectId: number | null;
    }) | null>;
}
export declare const taskService: TaskService;
//# sourceMappingURL=TaskService.d.ts.map