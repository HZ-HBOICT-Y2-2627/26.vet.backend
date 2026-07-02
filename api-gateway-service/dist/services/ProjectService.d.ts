import { ProjectInput, ProjectUpdateInput } from '../types';
export declare class ProjectService {
    getAllProjects(): Promise<({
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
    getProjectById(id: number): Promise<({
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
    createProject(input: ProjectInput): Promise<{
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
    updateProject(id: number, input: ProjectUpdateInput): Promise<{
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
    deleteProject(id: number): Promise<boolean>;
}
export declare const projectService: ProjectService;
//# sourceMappingURL=ProjectService.d.ts.map