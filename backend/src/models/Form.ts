import mongoose, { Schema, Document } from "mongoose";

export interface IForm extends Document {
  name: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  privacyPolicy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const formSchema = new Schema<IForm>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    privacyPolicy: {
      type: String,
      maxlength: 10000,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

formSchema.index({ createdBy: 1 });
formSchema.index({ isPublished: 1 });

export default mongoose.model<IForm>("Form", formSchema);
