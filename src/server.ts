import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";
import "reflect-metadata"
import { AppDataSource } from "./data-source";
const startServer = () => {
    const port = Config.PORT;
    try {
        app.listen(port, () => logger.info("Hello", port));

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((error) => {
        console.log("Error during Data Source initialization:", error);
    });
startServer();
