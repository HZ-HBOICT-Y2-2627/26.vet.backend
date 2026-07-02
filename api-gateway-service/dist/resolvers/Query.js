"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const services_1 = require("../services");
exports.Query = {
    // Task queries
    async tasks(_, { projectId, tagId, priority, status, }) {
        return services_1.taskService.getAllTasks({
            projectId,
            tagId,
            priority,
            status,
        });
    },
    async task(_, { id }) {
        return services_1.taskService.getTaskById(id);
    },
    // Project queries
    async projects() {
        return services_1.projectService.getAllProjects();
    },
    async project(_, { id }) {
        return services_1.projectService.getProjectById(id);
    },
    // Tag queries
    async tags() {
        return services_1.tagService.getAllTags();
    },
    async tag(_, { id }) {
        return services_1.tagService.getTagById(id);
    },
};
//# sourceMappingURL=Query.js.map