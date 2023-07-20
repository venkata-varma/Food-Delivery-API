import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./connectDB/connect";
import bodyParser from "body-parser";
import mainRouter from "./routes/main";
dotenv.config();
//initial app
const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));
app.use("/", mainRouter);
app.get('/', (req: Request, res: Response) => {
  res.send(":Internal projct")
})

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Page not found!" });
});
app.use((err: any, req: any, res: any, next: any) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500).json({ message: "bad request!", err });
});

const startServer = async () => {
  try {
    await connectDB(process.env.URL);
    const port = process.env.PORT || 8083;

    app.listen(port, function () {
      console.log("Server started at this port:-", port);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
