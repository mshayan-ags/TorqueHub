const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { Admin } = require("../models/Admin");

const APP_SECRET = process.env.JWT_SECRET;

function getTokenPayload(token) {
  return jwt.verify(token, APP_SECRET, { algorithms: ["HS256"] });
}

async function getUserId(req) {
  const authHeader = req?.headers?.authorization;
  if (!authHeader) {
    return { message: "No token found" };
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return { message: "No token found" };
  }

  try {
    const { id } = getTokenPayload(token);
    const isUser = await User.findOne({ _id: id });

    if (isUser?._id) return { id };
    return { message: "Not authenticated" };
  } catch (error) {
    return { message: "Not authenticated" };
  }
}

async function getAdminId(req) {
  const authHeader = req?.headers?.authorization;
  if (!authHeader) {
    return { message: "No token found" };
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return { message: "No token found" };
  }

  try {
    const { id, Role } = getTokenPayload(token);
    const isAdmin = await Admin.findOne({ _id: id });

    if (isAdmin?._id && isAdmin?.Role == Role) return { id, Role };
    return { message: "Not authenticated" };
  } catch (error) {
    return { message: "Not authenticated" };
  }
}

module.exports = {
  APP_SECRET,
  getUserId,
  getAdminId,
  getTokenPayload,
};
