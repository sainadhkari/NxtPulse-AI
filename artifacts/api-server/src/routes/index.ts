import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import traineesRouter from "./trainees";
import interventionsRouter from "./interventions";
import learnguardRouter from "./learnguard";
import demoIntelligenceRouter from "./demoIntelligence";
import silentDetectorRouter from "./silentDetector";
import understudyRouter from "./understudy";
import wellnessRouter from "./wellness";
import insightsRouter from "./insights";
import notificationsRouter from "./notifications";
import assistantRouter from "./assistant";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(traineesRouter);
router.use(interventionsRouter);
router.use(learnguardRouter);
router.use(demoIntelligenceRouter);
router.use(silentDetectorRouter);
router.use(understudyRouter);
router.use(wellnessRouter);
router.use(insightsRouter);
router.use(notificationsRouter);
router.use(assistantRouter);

export default router;
