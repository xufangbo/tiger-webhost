// Main starting point of the application
import express, { Application } from "express";
import compression from "compression";
import lusca from "lusca";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import session from "express-session";
import logger from "./util/logger";
import router from "./router";
import {
  WEBSERVER_SESSION_SECRET,
  WEBSERVER_SESSION_MAX_AGE,
  PORT
} from "./config";
import * as Prometheus from "./util/prometheus";

const app: Application = express();

// App Setup
app.use(helmet());
app.use(morgan("combined"));
app.use(
  session({
    secret: WEBSERVER_SESSION_SECRET,
    name: "session",
    cookie: { maxAge: WEBSERVER_SESSION_MAX_AGE as number },
    rolling: true,
    resave: false
  })
);
app.use(compression());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use(bodyParser.urlencoded({ extended: true }));
router(app);

// Server Setup
app.listen(PORT, (err: any) => {
  if (err) {
    return logger.error(err);
  }
  return logger.info("App is listening on port", PORT);
});

// Prometheus Setup
Prometheus.injectMetricsRoute(app);
Prometheus.startCollection();
