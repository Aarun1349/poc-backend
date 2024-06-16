import { asyncHandlerPromiseVersion } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Compiler } from "../models/complier.mode.js";
import { compileCode } from "../utils/Compiler.js";
export const compile = asyncHandlerPromiseVersion(async (req, res) => {
  const code = req.body.code;
  if (!code) {
    throw new ApiError("404", "please provide code to compile");
  }
  const found = await Url.findOne(code);
  if (found) {
    throw new ApiError("204", "Already compiled");
  }
  const result = compileCode(code);

  if (!result) {
    throw new ApiError("500", "Something went wrong");
  }
  const newCode = await Compiler.create({
    code,
    result,
  });
  if (!newCode) {
    throw new ApiError("500", "Something went wrong in db");
  }

  return res.status(200).send(
    new ApiResponse(200, {
      message: "success",
      newCode,
    })
  );
});
