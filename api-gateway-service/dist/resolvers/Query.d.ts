export declare const Query: {
    tasks(_: unknown, { projectId, tagId, priority, status, }: {
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
    task(_: unknown, { id }: {
        id: number;
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
    projects(): Promise<({
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
    })[]>;
    project(_: unknown, { id }: {
        id: number;
    }): Promise<({
        tasks: ({
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
        })[];
    } & {
        id: number;
        title: string;
        description: string | null;
    }) | null>;
    tags(): Promise<({
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
    })[]>;
    tag(_: unknown, { id }: {
        id: number;
    }): Promise<({
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
    }) | null>;
};
//# sourceMappingURL=Query.d.ts.map