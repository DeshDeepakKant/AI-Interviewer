import express from "express"
import { test, userSignUp, userLogin, getCurrentUser, verifyToken } from "../controllers/user.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"
const router = express.Router()

router.route("/test").get(verifyJWT,test)
router.route("/signUp").post(userSignUp)
router.route("/login").post(userLogin)
router.route("/currentUser").get(verifyJWT, getCurrentUser)
router.route("/verify").get(verifyJWT, verifyToken)

export default router