import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";
import "reflect-metadata"
import { AppDataSource } from "./data-source";
const startServer = () => {
    const port = Config.PORT;
    try {
        app.listen(port, () => logger.info(`Hello ${port}`));

    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
};
AppDataSource.initialize()
    .then(async () => {
        logger.info("Data Source has been initialized!");
        await AppDataSource.runMigrations()
    })
    .catch((error) => {
        logger.info("Error during Data Source initialization:", error);
    });
startServer();
