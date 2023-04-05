import { Router } from "express";
import { validateRequest } from "zod-express-middleware";

import logger from "../logger";

import gaslessSwap from "./gaslessSwap";
import { GaslessSwapBody } from "./schema/gaslessSwap.schema";

const router = Router();

router.post(
  "/gasless-swap",
  validateRequest({ body: GaslessSwapBody }),
  gaslessSwap
);

router.get("/", (req, res) => {
  logger.info("hello", { hello: "world" });

  res.send("hello");
});

export default router;
