import winston from "winston";

const transports: winston.transport[] = [
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
];

// Use a pretty print format for the console
transports.push(
    new winston.transports.Console({
        level: "info",
        format: winston.format.combine(
            winston.format.colorize(), // Add colors to the log level
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Format timestamp
            winston.format.printf(
                ({ level, message, timestamp, serviceName, ...metadata }) => {
                    let metaString = JSON.stringify(metadata, null, 2);
                    return `[${timestamp}] [${serviceName}] ${level}: ${message} ${metaString !== "{}" ? `\n${metaString}` : ""
                        }`;
                }
            )
        ),
    })
);

const logger = winston.createLogger({
    level: "info",
    defaultMeta: {
        serviceName: "auth-service",
    },
    transports,
});

export default logger;
