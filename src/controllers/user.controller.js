import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// * --------------------------------------------
// * generating access and refresh token function
// * --------------------------------------------

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw ApiError(
      500,
      "Somthing went wrong while generating refresh and access token!"
    );
  }
};

// * --------------------------------------------
// * register user method
// * --------------------------------------------

const registerUser = asyncHandler(async (req, res) => {
  // ===> get user detail from frontend
  // ===> validation ==> not empty
  // ===> check if user already exists: username,email
  // ===> check for images,check for avatar
  // ===> upload them to cloudinary, avatar
  // ===> create user object - create entry in db
  // ===> remove password and refresh token failed from response
  // ===> check for user creation
  // ===> return res

  const { username, email, fullName, password } = req.body;

  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required!");
  }

  // or operator is coming from mongoose and this operator is checked first object
  //  value if first is false then check second value

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists!");
  }

  let avatarLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files?.avatar[0]?.path;
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username?.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(200)
    .json(ApiResponse(200, createdUser, "User registered Successfully"));
});

// * --------------------------------------------
// * login user method
// * --------------------------------------------

const loginUser = asyncHandler(async (req, res) => {
  //  ===> req body  --> data
  //  ===> username or email
  //  ===> find the user
  //  ===> password check
  //  ===> access and refresh token
  //  ===> send cookies

  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw ApiError(400, "Username or Email is required!");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw ApiError(404, "User does not exist!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw ApiError(401, "Invalid user credentials!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged In Successfully!"
      )
    );
});

// * --------------------------------------------
// * logout user method
// * --------------------------------------------

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  /*  ** ye options ham islye use karte hen k koi frontend se hamary 
  cookie data  ko customize na karsake ye sirf server se hi customize hosake **  */

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(ApiResponse(200, "User Log out Successfully!"));
});

// * --------------------------------------------
// * refreshAccessToken user method
// * --------------------------------------------

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw ApiError(401, "Unauthorized request!");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw ApiError(401, "Invalid refresh token!");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw ApiError(401, "Refresh token is expired or used!");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed!"
        )
      );
  } catch (error) {
    throw ApiError(401, error?.message || "Invalid refresh token!");
  }
});

// * --------------------------------------------
// * refreshAccessToken user method
// * --------------------------------------------

const changeCurrentPassword = asyncHandler(async (res, req) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw ApiError(400, "Invalid old password!");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(ApiResponse(200, {}, "Password changed successFully!"));
});

// * --------------------------------------------
// * getCurrentUser user method
// * --------------------------------------------

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(ApiResponse(200, req.user, "Current user fetched successfully!"));
});

// * --------------------------------------------
// * updateAccountDetails user method
// * --------------------------------------------

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw ApiError(400, "All fields are required!");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(ApiResponse(200, user, "Account details updated successfully!"));
});

// * --------------------------------------------
// * updateUserAvatar user method
// * --------------------------------------------

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req?.file?.path;

  if (!avatarLocalPath) {
    throw ApiError(400, "Avatar file is missing!");
  }
  // TODO: delete old image - assignment

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw ApiError(400, "Error while uploading avatar!");
  }

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        avatar: avatar?.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(ApiResponse(200, user, "Avatar image updated successsfully!"));
});

// * --------------------------------------------
// * updateUserCoverImage user method
// * --------------------------------------------

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req?.file?.path;

  if (!coverImageLocalPath) {
    throw ApiError(400, "Cover image file is missing!");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw ApiError(400, "Error while uploading cover image!");
  }

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        coverImage: coverImage?.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(ApiResponse(200, user, "Cover image updated successsfully!"));
});

// * --------------------------------------------
// * getUserChannelProfile user method
// * --------------------------------------------

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw ApiError(400, "Username is missing!");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        /** when we write the model name's first letter capital, 
         in the mongo db it would be small and 
         also plural written 's' at the end of modal name  **/
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw ApiError(404, "Channel does not exists!");
  }

  return res
    .status(200)
    .json(ApiResponse(200, channel[0], "User channel fetched succesfully!"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
};
