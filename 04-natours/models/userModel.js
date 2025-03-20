const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address"]
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user"
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function(value) {
        return value === this.password;
      },
      message: "Passwords do not match"
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// MIDDLEWARE Hook: runs before .save() and .create() to hash the password and remove the passwordConfirm field
userSchema.pre("save", async function(next) {
  // Check if password was modified before hashing it
  if (!this.isModified("password")) return next();

  // Hash the password before saving it to the database
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// MIDDLEWARE Hook: runs before.save() and.create() but only if password was modified
userSchema.pre("save", function(next) {
  // Only update passwordChangedAt if password was actually modified
  if (!this.isModified("password") || this.isNew) return next();

  // Update the timestamp
  this.passwordChangedAt = new Date() - 1000;
  next();
});

// MIDDLEWARE Hook: runs before.find() and.findOne() but only returns active users
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// INSTANCE METHODS: Compares a candidate password with the hashed one in the database.
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  // Compare the hashed candidate password with the stored hashed password
  return await bcrypt.compare(candidatePassword, userPassword);
};

//INSTANCE METHOD: Checks if the password was changed after a given timestamp.
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // Check if JWTTimestamp is older than the passwordChangedAt timestamp (i.e. password was changed)
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// INSTANCE METHOD: Generates a reset token, hashes it, and stores it in the database.
userSchema.methods.createPasswordResetToken = function() {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and store it in the database
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set the token expiration time
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
