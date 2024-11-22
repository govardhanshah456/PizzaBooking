"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncateTables = void 0;
const truncateTables = async (connection) => {
    const entities = connection.entityMetadatas;
    await Promise.all(entities.map(async (entity) => {
        const repo = connection.getRepository(entity.name);
        await repo.clear();
    }));
};
exports.truncateTables = truncateTables;
