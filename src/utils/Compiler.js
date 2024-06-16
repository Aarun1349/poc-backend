import { ApiError } from "./ApiError";
import { exec } from "child_process";
export const compileCode = (codeToCompile) => {
  if (!codeToCompile) {
    throw new ApiError("404", "Provide code To Compile ");
  }

  if (codeToCompile) {
    let command = `node ${codeToCompile}`;
    exec(command, (err, stdout, stderr) => {
      if (err) return res.status(500).send(stderr);
      res.send(stdout);
    });
  }
};
