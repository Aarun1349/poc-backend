import { Schema, model } from "mongoose";

const coinSchema = new Schema(
  {
    coins: {
      required: true,
      type: Number,
      default: 0,
    },
    user: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Coin = model("Coin", coinSchema);
export { Coin };
