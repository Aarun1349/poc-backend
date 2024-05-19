import { asyncHandlerPromiseVersion } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Coin } from "../models/coins.model.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.accessToken = accessToken;
    await user.save({ validateBeforeSave: false });
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
};

const registerUser = asyncHandlerPromiseVersion(async (req, res) => {
  //Step 1: get user details from frontend
  const { username, fullname, email, password, role } = req.body;
  console.log("request_______", username, fullname, email, password, role);
  //Step2: validation
  if (
    [fullname, username, email, password, role].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //Step3: if user already exist
  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new ApiError(400, "user already existed");
  }

  //Step6: create entry in db

  const newUser = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    role,
  });

  //Step7: check for user creation
  const user = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (user) {
    return res.status(201).json(new ApiResponse(200, user));
  } else {
    throw new ApiError(500, "Something went wrong");
  }
});

const loginUser = asyncHandlerPromiseVersion(async (req, res) => {
  //Step: 1 get user details from database
  const { username, email, password } = req.body;

  if ((!username || !email) && !password) {
    throw new ApiError(400, "username or email is required");
  }
  //Step2: validation
  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const getUser = await User.findOne({ $or: [{ username }, { email }] });

  //Step: 2 check user if exist or not
  if (!getUser) {
    throw new ApiError(404, "User does not exist");
  }

  //Step: 3 check password is correct or not

  const isPasswordMatch = await getUser.isPasswordCorrect(password);

  if (!isPasswordMatch) {
    throw new ApiError(402, "Password does not match");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    getUser._id
  );

  const loggedInUser = await User.findById(getUser._id).select(
    "-password -refreshToken"
  );

  const options = { httpOnly: true, secure: true };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandlerPromiseVersion(async (req, res) => {
  await User.findOneAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 }, // this removes the field from document
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandlerPromiseVersion(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Uauthorized request. Please login again");
  }
  const verifyToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  if (!verifyToken) {
    throw new ApiError(401, "Please login again");
  }
  const userId = verifyToken._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found. Please create your account");
  }
  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh Token is Invalid or expired");
  }
  const options = {
    httpOnly: true,
    secure: true,
  };
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: user,
        accessToken,
        refreshToken: "Access token refereshed",
      })
    );
});

const changeCurrentPassword = asyncHandlerPromiseVersion(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Please provide required details");
  }
  const user = await User.findById(req.user?._id).select(" -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password not matched");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false }, { new: true });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Password Updated Successfully!"));
});

const getCurrentUser = asyncHandlerPromiseVersion(async (req, res) => {
  const user = await User.findById(req.user?._id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(new ApiResponse(200, user));
});

const getCurrentUserRole = asyncHandlerPromiseVersion(async (req, res) => {
  const user = await User.findById(req.user?._id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(new ApiResponse(200, user.role));
});

const updateUserDetails = asyncHandlerPromiseVersion(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "Please provide required details");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Details Updated Successfully!"));
});

const createNewAdmin = asyncHandlerPromiseVersion(async (req, res) => {
  const { email, password, username, fullname } = req.body;

  if (
    [email, password, username, fullname].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const role = req.user.role;
  console.log("role___", role);
  if (role !== "super_admin") {
    throw new ApiError(401, "You have no previlage to create admins");
  }

  //Step3: if user already exist
  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new ApiError(400, "admin already existed");
  }
  const newUser = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    role: "admin",
  });
  const user = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (user) {
    return res.status(201).json(new ApiResponse(200, user));
  } else {
    throw new ApiError(500, "Something went wrong");
  }
});

const createNewClient = asyncHandlerPromiseVersion(async (req, res) => {
  const { email, password, username, fullname } = req.body;

  if (
    [email, password, username, fullname].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const role = req.user.role;
  if (role !== "admin") {
    throw new ApiError(401, "You have no previlage to create clients");
  }

  //Step3: if user already exist
  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new ApiError(400, "client already existed");
  }
  const newUser = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    role: "client",
  });

  const user = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (user) {
    const generateCoins = await Coin.create({
      user: user.id,
      coins: req.body.coins ? parseInt(req.body.coins) : 0,
    });
    if (generateCoins) {
        return res
      .status(201)
      .json(new ApiResponse(200, { user, coins: generateCoins.coins }));
    }else{
        return res
      .status(201)
      .json(new ApiResponse(200, { user, message: "Coin generation failed, please login as client and add coins manually" }));
    }

    
  } else {
    throw new ApiError(500, "Something went wrong");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  getCurrentUserRole,
  changeCurrentPassword,
  updateUserDetails,
  createNewAdmin,
  createNewClient,
};
