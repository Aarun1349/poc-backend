import { Schema, model } from "mongoose";

const compilerSchema = new Schema(
  {
    code: {
      required: true,
      type: String,
    },
    result: {
      type: String,
      default: "Failed to execute",
    },
  },
  { timestamps: true }
);

const Compiler = model("Compiler", compilerSchema);
export { Compiler };
