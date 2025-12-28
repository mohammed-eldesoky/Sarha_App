import express from "express";
import bootstrap from "../src/app.controller.js";
import schedule from "node-schedule";
import { User } from "../src/DB/models/user.model.js";
import { Message } from "../src/DB/models/message.model.js";

const app = express();

// ⚠️ ملاحظة
// node-schedule غير مضمون على Vercel
schedule.scheduleJob("1 2 3 * * *", async () => {
  const users = await User.find({
    deletedAt: { $lte: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000 },
  });

  await User.deleteMany({
    deletedAt: { $lte: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000 },
  });

  await Message.deleteMany({
    receiver: { $in: users.map((user) => user._id) },
  });
});

bootstrap(app, express);

// ❌ لا app.listen
export default app;
