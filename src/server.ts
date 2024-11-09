import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";

const startServer = () => {
    const port = Config.PORT;
    try {
        app.listen(port, () => logger.info("Hello"));
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();
