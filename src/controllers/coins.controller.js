import { asyncHandlerPromiseVersion } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Coin } from "../models/coins.model.js";
import mongoose from "mongoose";

const getUserCoins = asyncHandlerPromiseVersion(async (req, res) => {
  const user = req.user.id;
  if (!user) {
    throw new ApiError("404", "please login first");
  }
  const role = req.user.role;
  if (role !== "client" || role !=="admin") {
    throw new ApiError("401", "you are not authorized");
  }
  const coins = await Coin.findOne({
    user: user,
  });

  if (!coins) {
    throw new ApiError("404", "user not found");
  } else {
    return res.status(201).json(new ApiResponse(200, { coins: coins.coins }));
  }
});

const updateCoins = asyncHandlerPromiseVersion(async (req, res) => {
  const user = req.user.id;
  const { coins } = req.body;
  if (!user) {
    throw new ApiError("404", "please login first");
  }
  const role = req.user.role;
  if (role !== "client") {
    throw new ApiError("401", "you are not authorized");
  }
  const coin = await Coin.findOneAndUpdate(
    { user: req.user?._id },
    {
      $set: {
        coins: coins,
      },
    },
    { new: true }
  );
  if (!coin) {
    throw new ApiError("404", "no coins");
  } else {
    return res.status(201).json(new ApiResponse(200, { coins: coin.coins }));
  }
});

export { getUserCoins, updateCoins };
