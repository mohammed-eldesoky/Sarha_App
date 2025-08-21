import { connectDB } from "./DB/connection.js";
import { authRouter, messageRouter, userRouter } from "./modules/index.js";
import cors from "cors";
import { globalErorrHandler } from "./utils/error/index.js";

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
  app.use(globalErorrHandler);

  //connectDB  : >> operation buffering
  connectDB();
}
export default bootstrap;
