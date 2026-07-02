import { TagInput, TagUpdateInput } from '../types';
export declare class TagService {
    getAllTags(): Promise<({
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
    getTagById(id: number): Promise<({
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
    createTag(input: TagInput): Promise<{
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
    updateTag(id: number, input: TagUpdateInput): Promise<{
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
    deleteTag(id: number): Promise<boolean>;
}
export declare const tagService: TagService;
//# sourceMappingURL=TagService.d.ts.map