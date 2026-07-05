import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";

const router = Router();

router.get(
    "/",
    ChatController.renderChat
);

router.post(
    "/new",
    ChatController.newChat
);

router.post(
    "/message",
    ChatController.sendMessage
);

router.post(
    "/menu",
    ChatController.node
);

export default router;