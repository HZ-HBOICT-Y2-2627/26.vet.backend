"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.typeDefs = (0, graphql_tag_1.gql) `
  scalar DateTime

  type Project {
    id: Int!
    title: String!
    description: String
    tasks: [Task!]!
  }

  type Task {
    id: Int!
    title: String!
    description: String
    priority: Int!
    status: Int!
    progress: Int!
    createdAt: DateTime!
    completedAt: DateTime
    projectId: Int
    project: Project
    tags: [Tag!]!
  }

  type Tag {
    id: Int!
    title: String!
    tasks: [Task!]!
  }

  type Query {
    # Task queries
    tasks(
      projectId: Int
      tagId: Int
      priority: Int
      status: Int
    ): [Task!]!
    task(id: Int!): Task

    # Project queries
    projects: [Project!]!
    project(id: Int!): Project

    # Tag queries
    tags: [Tag!]!
    tag(id: Int!): Tag
  }

  type Mutation {
    # Task mutations
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: Int!, input: UpdateTaskInput!): Task!
    deleteTask(id: Int!): Boolean!

    # Project mutations
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: Int!, input: UpdateProjectInput!): Project!
    deleteProject(id: Int!): Boolean!

    # Tag mutations
    createTag(input: CreateTagInput!): Tag!
    updateTag(id: Int!, input: UpdateTagInput!): Tag!
    deleteTag(id: Int!): Boolean!

    # Task-Tag relationship mutations
    addTagToTask(taskId: Int!, tagId: Int!): Task!
    removeTagFromTask(taskId: Int!, tagId: Int!): Task!
  }

  input CreateTaskInput {
    title: String!
    description: String
    priority: Int!
    status: Int!
    progress: Int
    projectId: Int
  }

  input UpdateTaskInput {
    title: String
    description: String
    priority: Int
    status: Int
    progress: Int
    projectId: Int
  }

  input CreateProjectInput {
    title: String!
    description: String
  }

  input UpdateProjectInput {
    title: String
    description: String
  }

  input CreateTagInput {
    title: String!
  }

  input UpdateTagInput {
    title: String
  }
`;
//# sourceMappingURL=typeDefs.js.map