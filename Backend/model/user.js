const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    dateOfBirth: Date,
    age: Number,
    profession: String,
    bio: String,
    profilePhoto: { type: String, default: "/images/default-avatar.png" },
    address: String,
    membershipType: { type: String, default: "basic" },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.hashPassword = function (password) {
  return crypto.createHash("sha256").update(password).digest("hex");
};

userSchema.methods.validatePassword = function (password) {
  return this.password === this.hashPassword(password);
};

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = this.hashPassword(this.password);
  }
  next();
});

const User = mongoose.model("User", userSchema);

const register = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("Email already registered");
    }
    const user = new User(userData);
    await user.save();
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

const login = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    if (!user.validatePassword(password)) {
      throw new Error("Invalid email or password");
    }
    const { password: pwd, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

module.exports = { User, register, login };
