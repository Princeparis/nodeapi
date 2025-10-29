import * as dotenv from "dotenv";

dotenv.config();

import app from "./server";
import "./listeners";

dotenv.config();

app.listen(3001, () => {
  console.log("listening on port 3001");
});
