import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import expressWinston, { logger } from "express-winston";

import customLogger, { loggerOptions } from "../logger";
import routes from "./routes";

const port = process.env.PORT || 8000;

const app = express();

// add middle-wares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// add express-winston logs
app.use(expressWinston.logger(loggerOptions));

// listen to provided port
app.listen(port, () => {
  customLogger.info(`The application is listening on port ${port}`);
});

app.use(routes);

// add express-winston error logger
app.use(expressWinston.errorLogger(loggerOptions));
