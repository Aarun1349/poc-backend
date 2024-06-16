import { Schema, model } from "mongoose";

const urlSchema = new Schema(
  {
    url: {
     
      type: String,
      default: '',
    },
    itsy_bitsy_url: {
      type: String,
      default: "",
    },
    ip_address: {
      type: String,
      default: "0.0.0.0",
    },
  },
  { timestamps: true }
);

const Url = model("Url", urlSchema);
export { Url };
