import { connectDB } from "./DB/connection.js";
import { authRouter, messageRouter, userRouter } from "./modules/index.js";
import cors from "cors";
import fs from "fs";
function bootstrap(app, express) {
  //parse req body [raw json]
  app.use(express.json());

  //2-app.use(express.static())

  //cors
  app.use(
    cors({
      origin: "*",
      //origin // who connect to my project
    })
  );
  //route handlers
  app.use("/auth", authRouter);
  app.use("/message", messageRouter);
  app.use("/user", userRouter);

  //global error handler
  app.use((err, req, res, next) => {
    if (req.file) {
      fs.unlinkSync(req.file.path); //if error, delete the file
    }

    res
      .status(err.cause || 500)
      .json({
        message: err.message,
        success: false,
        stack: err.stack,
        error: err,
      });
  });

  //connectDB  : >> operation buffering
  connectDB();
}
export default bootstrap;
