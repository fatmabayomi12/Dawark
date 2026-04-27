import jwt from "jsonwebtoken";

export const createToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};
