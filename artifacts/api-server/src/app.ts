import express, { type Express, type Request } from "express";
import cors, { type CorsOptions } from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const replitDevDomain = process.env.REPLIT_DEV_DOMAIN;
const allowedOriginPattern = replitDevDomain
  ? new RegExp(`^https?://(localhost(:\\d+)?|[^/]*${replitDevDomain.replace(/\./g, "\\.")}(:\\d+)?)$`)
  : null;

const restrictedCors: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      callback(null, false);
      return;
    }
    if (allowedOriginPattern && allowedOriginPattern.test(origin)) {
      callback(null, true);
    } else if (!replitDevDomain) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
};

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: Request) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use("/api/chat", cors(restrictedCors));
app.use("/api/mcp", cors(restrictedCors));
app.use(/^(?!\/api\/(chat|mcp)).*$/, cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
