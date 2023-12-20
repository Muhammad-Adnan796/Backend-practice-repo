import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    throw new ApiError(400, "All field are requiredF");
  }

  // or operator is coming from mongoose and this operator is checked first object
  //  value if first is false then check second value

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
    username: username.toLowerCase(),
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

export { registerUser, loginUser, logoutUser };


