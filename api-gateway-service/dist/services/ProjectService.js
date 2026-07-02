"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = exports.ProjectService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ProjectService {
    async getAllProjects() {
        try {
            return await prisma.project.findMany({
                include: {
                    tasks: true,
                },
                orderBy: {
                    id: 'asc',
                },
            });
        }
        catch (error) {
            throw new Error(`Failed to fetch projects: ${error}`);
        }
    }
    async getProjectById(id) {
        try {
            return await prisma.project.findUnique({
                where: { id },
                include: {
                    tasks: {
                        include: {
                            tags: {
                                include: {
                                    tag: true,
                                },
                            },
                        },
                    },
                },
            });
        }
        catch (error) {
            throw new Error(`Failed to fetch project: ${error}`);
        }
    }
    async createProject(input) {
        if (!input.title || input.title.trim() === '') {
            throw new Error('Title is required');
        }
        try {
            return await prisma.project.create({
                data: {
                    title: input.title,
                    description: input.description,
                },
                include: {
                    tasks: true,
                },
            });
        }
        catch (error) {
            throw new Error(`Failed to create project: ${error}`);
        }
    }
    async updateProject(id, input) {
        if (input.title !== undefined && input.title.trim() === '') {
            throw new Error('Title cannot be empty');
        }
        try {
            return await prisma.project.update({
                where: { id },
                data: {
                    ...(input.title && { title: input.title }),
                    ...(input.description !== undefined && { description: input.description }),
                },
                include: {
                    tasks: true,
                },
            });
        }
        catch (error) {
            throw new Error(`Failed to update project: ${error}`);
        }
    }
    async deleteProject(id) {
        try {
            await prisma.project.delete({
                where: { id },
            });
            return true;
        }
        catch (error) {
            throw new Error(`Failed to delete project: ${error}`);
        }
    }
}
exports.ProjectService = ProjectService;
exports.projectService = new ProjectService();
//# sourceMappingURL=ProjectService.js.map