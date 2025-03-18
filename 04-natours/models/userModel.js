const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
  passwordChangedAt: Date
  //   token: String,
  //   tokenExpiration: Date
});

// MIDDLEWARE: runs before.save() and.create() but only if password was modified
userSchema.pre("save", async function(next) {
  // Check if password was modified before hashing it
  if (!this.isModified("password")) return next();

  // Hash the password before saving it to the database
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// INSTANCE METHODS: check if candidate password matches the stored hashed password
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  // Compare the hashed candidate password with the stored hashed password
  return await bcrypt.compare(candidatePassword, userPassword);
};

//INSTANCE METHOD: check whether the password was changed
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

const User = mongoose.model("User", userSchema);

module.exports = User;
