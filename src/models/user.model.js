import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import { createError } from "../utils/apiResponse.js"
import { ERROR_CODES } from "../utils/errorDictionary.js"

const BCRYPT_SALT_ROUNDS = 10

const documentSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  {
    _id: false
  }
)

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["admin", "customer", "store"],
      default: "customer"
    },
    documents: {
      type: [documentSchema],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password
        return ret
      }
    }
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return

  if (bcrypt.truncates(this.password)) {
    throw createError(
      ERROR_CODES.VALIDATION_ERROR,
      "La contraseña no puede superar los 72 bytes"
    )
  }

  this.password = await bcrypt.hash(
    this.password,
    BCRYPT_SALT_ROUNDS
  )
})

userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate()

  if (!update) return

  const hasSetPassword = Object.hasOwn(update.$set ?? {}, "password")
  const hasDirectPassword = Object.hasOwn(update, "password")

  if (!hasSetPassword && !hasDirectPassword) return

  const password = hasSetPassword
    ? update.$set.password
    : update.password

  if (
    typeof password !== "string" ||
    password.length === 0 ||
    bcrypt.truncates(password)
  ) {
    throw createError(
      ERROR_CODES.VALIDATION_ERROR,
      "La contraseña debe ser un texto no vacio de hasta 72 bytes"
    )
  }

  const hashedPassword = await bcrypt.hash(
    password,
    BCRYPT_SALT_ROUNDS
  )

  if (hasSetPassword) {
    update.$set.password = hashedPassword
  } else {
    update.password = hashedPassword
  }

  this.setUpdate(update)
})

userSchema.pre("insertMany", function (next, docs) {
  const hashPasswords = async () => {
    for (const doc of docs) {
      if (
        typeof doc.password !== "string" ||
        doc.password.length === 0 ||
        bcrypt.truncates(doc.password)
      ) {
        throw createError(
          ERROR_CODES.VALIDATION_ERROR,
          "La contraseña debe ser un texto no vacio de hasta 72 bytes"
        )
      }
    }

    for (const doc of docs) {
      doc.password = await bcrypt.hash(
        doc.password,
        BCRYPT_SALT_ROUNDS
      )
    }
  }

  hashPasswords().then(() => next(), next)
})

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
