"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const graphql_1 = require("graphql");
const Query_1 = require("./Query");
const Mutation_1 = require("./Mutation");
// DateTime scalar resolver
const DateTimeScalar = new graphql_1.GraphQLScalarType({
    name: 'DateTime',
    description: 'DateTime custom scalar type',
    serialize: (value) => {
        if (value instanceof Date) {
            return value.toISOString();
        }
        return value;
    },
    parseValue: (value) => {
        if (typeof value === 'string') {
            return new Date(value);
        }
        return value;
    },
    parseLiteral: (ast) => {
        if (ast.kind === graphql_1.Kind.STRING) {
            return new Date(ast.value);
        }
        return null;
    },
});
exports.resolvers = {
    Query: Query_1.Query,
    Mutation: Mutation_1.Mutation,
    DateTime: DateTimeScalar,
    Task: {
        tags: async (parent) => {
            if (parent.tags && Array.isArray(parent.tags)) {
                return parent.tags.map((tag) => tag.tag || tag);
            }
            return [];
        },
    },
    Tag: {
        tasks: async (parent) => {
            if (parent.tasks && Array.isArray(parent.tasks)) {
                return parent.tasks.map((taskTag) => taskTag.task || taskTag);
            }
            return [];
        },
    },
    Project: {
        tasks: async (parent) => {
            if (parent.tasks && Array.isArray(parent.tasks)) {
                return parent.tasks;
            }
            return [];
        },
    },
};
//# sourceMappingURL=index.js.map