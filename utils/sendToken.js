const sendToken = (res, user, statusCode) => {
  const token = user.getJwtToken();

  const coptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    sameSite: process.env.NODE_ENV === "Production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "Production" ? true : false,
  };

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    tasks: user.tasks,
    verified: user.verified,
  };

  res.status(statusCode).cookie("userToken", token, coptions).json({
    success: true,
    user: userData,
    token,
  });
};

export default sendToken;
