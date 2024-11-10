import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    defaultMeta: {
        serviceName: "auth-service",
    },
    transports: [
        new winston.transports.File({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            dirname: "logs",
            filename: "app.log",
        }),
        new winston.transports.File({
            level: "error",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            dirname: "logs",
            filename: "error.log",
        }),
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
        }),
    ],
});

export default logger;
