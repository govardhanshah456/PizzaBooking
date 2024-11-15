import { DataSource } from "typeorm"

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;
    await Promise.all(entities.map(async (entity) => {
        const repo = connection.getRepository(entity.name);
        await repo.clear()
    }))
}