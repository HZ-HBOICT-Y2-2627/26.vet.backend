"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = exports.TaskService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TaskService {
    async getAllTasks(filters) {
        try {
            if (filters?.tagId) {
                // Get tasks by tag
                return await prisma.task.findMany({
                    where: {
                        tags: {
                            some: {
                                tagId: filters.tagId,
                            },
                        },
                    },
                    include: {
                        project: true,
                        tags: {
                            include: {
                                tag: true,
                            },
                        },
                    },
                });
            }
            // Get tasks with optional filters
            return await prisma.task.findMany({
                where: {
                    ...(filters?.projectId && { projectId: filters.projectId }),
                    ...(filters?.priority !== undefined && { priority: filters.priority }),
                    ...(filters?.status !== undefined && { status: filters.status }),
                },
                include: {
                    project: true,
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        catch (error) {
            throw new Error(`Failed to fetch tasks: ${error}`);
        }
    }
    async getTaskById(id) {
        try {
            return await prisma.task.findUnique({
                where: { id },
                include: {
                    project: true,
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            throw new Error(`Failed to fetch task: ${error}`);
        }
    }
    async createTask(input) {
        // Validate priority (0-3) and status (0-4)
        if (input.priority < 0 || input.priority > 3) {
            throw new Error('Priority must be between 0 and 3');
        }
        if (input.status < 0 || input.status > 4) {
            throw new Error('Status must be between 0 and 4');
        }
        if (!input.title || input.title.trim() === '') {
            throw new Error('Title is required');
        }
        try {
            return await prisma.task.create({
                data: {
                    title: input.title,
                    description: input.description,
                    priority: input.priority,
                    status: input.status,
                    progress: input.progress || 0,
                    projectId: input.projectId,
                },
                include: {
                    project: true,
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            throw new Error(`Failed to create task: ${error}`);
        }
    }
    async updateTask(id, input) {
        // Validate inputs if provided
        if (input.priority !== undefined && (input.priority < 0 || input.priority > 3)) {
            throw new Error('Priority must be between 0 and 3');
        }
        if (input.status !== undefined && (input.status < 0 || input.status > 4)) {
            throw new Error('Status must be between 0 and 4');
        }
        if (input.title !== undefined && input.title.trim() === '') {
            throw new Error('Title cannot be empty');
        }
        try {
            return await prisma.task.update({
                where: { id },
                data: {
                    ...(input.title && { title: input.title }),
                    ...(input.description !== undefined && { description: input.description }),
                    ...(input.priority !== undefined && { priority: input.priority }),
                    ...(input.status !== undefined && { status: input.status }),
                    ...(input.progress !== undefined && { progress: input.progress }),
                    ...(input.projectId !== undefined && { projectId: input.projectId }),
                },
                include: {
                    project: true,
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            throw new Error(`Failed to update task: ${error}`);
        }
    }
    async deleteTask(id) {
        try {
            await prisma.task.delete({
                where: { id },
            });
            return true;
        }
        catch (error) {
            throw new Error(`Failed to delete task: ${error}`);
        }
    }
    async addTagToTask(taskId, tagId) {
        try {
            // Check if tag already exists for task
            const existing = await prisma.taskTag.findUnique({
                where: {
                    taskId_tagId: {
                        taskId,
                        tagId,
                    },
                },
            });
            if (!existing) {
                await prisma.taskTag.create({
                    data: {
                        taskId,
                        tagId,
                    },
                });
            }
            return await this.getTaskById(taskId);
        }
        catch (error) {
            throw new Error(`Failed to add tag to task: ${error}`);
        }
    }
    async removeTagFromTask(taskId, tagId) {
        try {
            await prisma.taskTag.deleteMany({
                where: {
                    taskId,
                    tagId,
                },
            });
            return await this.getTaskById(taskId);
        }
        catch (error) {
            throw new Error(`Failed to remove tag from task: ${error}`);
        }
    }
}
exports.TaskService = TaskService;
exports.taskService = new TaskService();
//# sourceMappingURL=TaskService.js.map