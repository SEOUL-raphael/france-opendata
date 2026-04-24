import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import mcpRouter from "./mcp";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(mcpRouter);

export default router;
