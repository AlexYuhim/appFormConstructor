import mongoose, { Schema, Document } from "mongoose";

export interface IFormSection extends Document {
  formId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const formSectionSchema = new Schema<IFormSection>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

formSectionSchema.index({ formId: 1, order: 1 });

export default mongoose.model<IFormSection>("FormSection", formSectionSchema);
