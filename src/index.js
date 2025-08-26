import express from "express";
import bootstrap from "./app.controller.js";
import { User } from "./DB/models/user.model.js";
import schedule from "node-schedule";
import { Message } from './DB/models/message.model.js';
const app = express();
const port = 3000;
// delete users who are inactive for 3 months
schedule.scheduleJob("1 2 3 * * *", async () => {
  const users = await User.find({
    deletedAt: { $lte: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000 },
  }); // find return [{},{}] || []
 
  await User.deleteMany({
    deletedAt: { $lte: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000 },
  });
  //DELETE MESSAGES
  await Message.deleteMany({
    receiver: { $in: users.map((user) => user._id) },
  });
}); //every day 3h:2m:1s

bootstrap(app, express);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
