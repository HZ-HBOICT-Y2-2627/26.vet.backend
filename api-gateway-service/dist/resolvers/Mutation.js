"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mutation = void 0;
const services_1 = require("../services");
const schemas_1 = require("../validation/schemas");
const errors_1 = require("../utils/errors");
exports.Mutation = {
    // Task mutations
    async createTask(_, { input }) {
        try {
            const validated = schemas_1.createTaskInputSchema.parse(input);
            return await services_1.taskService.createTask(validated);
        }
        catch (error) {
            return (0, errors_1.handleValidationError)(error);
        }
    },
    async updateTask(_, { id, input }) {
        try {
            const validated = schemas_1.updateTaskInputSchema.parse(input);
            return await services_1.taskService.updateTask(id, validated);
        }
        catch (error) {
            return (0, errors_1.handleValidationError)(error);
        }
    },
    async deleteTask(_, { id }) {
        try {
            return await services_1.taskService.deleteTask(id);
        }
        catch (error) {
            return (0, errors_1.handleDatabaseError)(error);
        }
    },
    // Project mutations
    async createProject(_, { input }) {
        try {
            const validated = schemas_1.createProjectInputSchema.parse(input);
            return await services_1.projectService.createProject(validated);
        }
        catch (error) {
            return (0, errors_1.handleValidationError)(error);
        }
    },
    async updateProject(_, { id, input }) {
        try {
            const validated = schemas_1.updateProjectInputSchema.parse(input);
            return await services_1.projectService.updateProject(id, validated);
        }
        catch (error) {
            return (0, errors_1.handleValidationError)(error);
        }
    },
    async deleteProject(_, { id }) {
        try {
            return await services_1.projectService.deleteProject(id);
        }
        catch (error) {
            return (0, errors_1.handleDatabaseError)(error);
        }
    },
    // Tag mutations
    async createTag(_, { input }) {
        try {
            const validated = schemas_1.createTagInputSchema.parse(input);
            return await services_1.tagService.createTag(validated);
        }
        catch (error) {
            return (0, errors_1.handleValidationError)(error);
        }
    },
    async updateTag(_, { id, input }) {
        try {
            const validated = schemas_1.updateTagInputSchema.parse(input);
            return await services_1.tagService.updateTag(id, validated);
        }
        catch (error) {
            return (0, errors_1.handleValidationError)(error);
        }
    },
    async deleteTag(_, { id }) {
        try {
            return await services_1.tagService.deleteTag(id);
        }
        catch (error) {
            return (0, errors_1.handleDatabaseError)(error);
        }
    },
    // Task-Tag relationship mutations
    async addTagToTask(_, { taskId, tagId }) {
        try {
            return await services_1.taskService.addTagToTask(taskId, tagId);
        }
        catch (error) {
            return (0, errors_1.handleDatabaseError)(error);
        }
    },
    async removeTagFromTask(_, { taskId, tagId }) {
        try {
            return await services_1.taskService.removeTagFromTask(taskId, tagId);
        }
        catch (error) {
            return (0, errors_1.handleDatabaseError)(error);
        }
    },
};
//# sourceMappingURL=Mutation.js.map