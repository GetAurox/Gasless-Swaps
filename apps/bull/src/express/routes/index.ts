import { Router } from "express";
import { validateRequest } from "zod-express-middleware";

import getAddresses from "./getAddresses";
import getAddressesWithBalances from "./getAddressesWithBalances";
import getCanJobBeProcessed from "./getCanJobBeProcessed";
import getIsValidTransactionRequest from "./getIsValidTransactionRequest";
import { IsValidTransactionRequestBody } from "./schema/getIsValidTransactionRequest.schema";

const router = Router();

router.get("/addresses", getAddresses);
router.get("/addresses-with-balances", getAddressesWithBalances);
router.get("/can-job-be-processed", getCanJobBeProcessed);
router.post(
  "/is-valid-transaction-request",
  validateRequest({ body: IsValidTransactionRequestBody }),
  getIsValidTransactionRequest
);
router.get("/", (req, res) => res.send("Hello"));

export default router;
