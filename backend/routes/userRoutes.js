import express from "express";
import { getMe, getAgents} from "../controllers/usercontroller.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";


const router = express.Router();


router.get("/me", protect, getMe);

router.get(
  "/admin-test",
  protect,
  authorize("admin"),
  (req, res) => {
    res.json({
      message: "Welcome admin",
    });
  }
);
router.get(
  "/agents",
  protect,
  authorize("admin"),
  getAgents
);


export default router;