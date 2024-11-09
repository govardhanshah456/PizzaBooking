import app from "./app";
import { Config } from "./config";

const startServer = () => {
    const port = Config.PORT;
    try {
        app.listen(port, () => console.log("Hello"));
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();
