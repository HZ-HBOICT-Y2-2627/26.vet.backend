import { TaskInput, TaskUpdateInput, ProjectInput, ProjectUpdateInput, TagInput, TagUpdateInput } from '../types';
export declare const Mutation: {
    createTask(_: unknown, { input }: {
        input: TaskInput;
    }): Promise<{
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
    updateTask(_: unknown, { id, input }: {
        id: number;
        input: TaskUpdateInput;
    }): Promise<{
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
    deleteTask(_: unknown, { id }: {
        id: number;
    }): Promise<boolean>;
    createProject(_: unknown, { input }: {
        input: ProjectInput;
    }): Promise<{
        tasks: {
            id: number;
            title: string;
            description: string | null;
            priority: number;
            status: number;
            progress: number;
            createdAt: Date;
            completedAt: Date | null;
            projectId: number | null;
        }[];
    } & {
        id: number;
        title: string;
        description: string | null;
    }>;
    updateProject(_: unknown, { id, input }: {
        id: number;
        input: ProjectUpdateInput;
    }): Promise<{
        tasks: {
            id: number;
            title: string;
            description: string | null;
            priority: number;
            status: number;
            progress: number;
            createdAt: Date;
            completedAt: Date | null;
            projectId: number | null;
        }[];
    } & {
        id: number;
        title: string;
        description: string | null;
    }>;
    deleteProject(_: unknown, { id }: {
        id: number;
    }): Promise<boolean>;
    createTag(_: unknown, { input }: {
        input: TagInput;
    }): Promise<{
        tasks: ({
            task: {
                id: number;
                title: string;
                description: string | null;
                priority: number;
                status: number;
                progress: number;
                createdAt: Date;
                completedAt: Date | null;
                projectId: number | null;
            };
        } & {
            tagId: number;
            taskId: number;
        })[];
    } & {
        id: number;
        title: string;
    }>;
    updateTag(_: unknown, { id, input }: {
        id: number;
        input: TagUpdateInput;
    }): Promise<{
        tasks: ({
            task: {
                id: number;
                title: string;
                description: string | null;
                priority: number;
                status: number;
                progress: number;
                createdAt: Date;
                completedAt: Date | null;
                projectId: number | null;
            };
        } & {
            tagId: number;
            taskId: number;
        })[];
    } & {
        id: number;
        title: string;
    }>;
    deleteTag(_: unknown, { id }: {
        id: number;
    }): Promise<boolean>;
    addTagToTask(_: unknown, { taskId, tagId }: {
        taskId: number;
        tagId: number;
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
    }) | null>;
    removeTagFromTask(_: unknown, { taskId, tagId }: {
        taskId: number;
        tagId: number;
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
    }) | null>;
};
//# sourceMappingURL=Mutation.d.ts.map