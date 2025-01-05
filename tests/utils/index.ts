import { DataSource } from "typeorm"
import { AppDataSource } from "../../src/data-source";
import logger from "../../src/config/logger";

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;
    await Promise.all(entities.map(async (entity) => {
        const repo = connection.getRepository(entity.name);
        await repo.clear()
    }))
}

export const isValidJwt = (jwt: string): boolean => {
    if (jwt.split(".").length != 3)
        return false;
    else {
        try {
            jwt.split(".").forEach((token) => {
                Buffer.from(token, "base64").toString("utf-8")
            })

        } catch (err) {
            logger.error(err)
            return false;
        }
    }
    return true
}

export const getTestConnection = async () => {
    return await AppDataSource.initialize();
};

export const closeTestConnection = async (connection: DataSource) => {
    if (connection && connection.isInitialized) {
        await connection.destroy();
        connection = null as unknown as DataSource;
    }
};

export const resetDatabase = async (connection: DataSource) => {
    const conn = connection;
    await conn.transaction(async () => {
        await conn.dropDatabase();
        await conn.synchronize();
    });
};