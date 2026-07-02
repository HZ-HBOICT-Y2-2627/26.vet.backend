import { GraphQLScalarType } from 'graphql';
export declare const resolvers: {
    Query: {
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
    Mutation: {
        createTask(_: unknown, { input }: {
            input: import("../types").TaskInput;
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
            input: import("../types").TaskUpdateInput;
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
            input: import("../types").ProjectInput;
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
            input: import("../types").ProjectUpdateInput;
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
            input: import("../types").TagInput;
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
            input: import("../types").TagUpdateInput;
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
    DateTime: GraphQLScalarType<unknown, unknown>;
    Task: {
        tags: (parent: any) => Promise<any>;
    };
    Tag: {
        tasks: (parent: any) => Promise<any>;
    };
    Project: {
        tasks: (parent: any) => Promise<any>;
    };
};
//# sourceMappingURL=index.d.ts.map