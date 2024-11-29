import { DataSource } from "typeorm"

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
            console.log(err)
            return false;
        }
    }
    return true
}