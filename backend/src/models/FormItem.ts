import mongoose, { Schema, Document } from "mongoose";

export interface IFormItem extends Document {
  sectionId: mongoose.Types.ObjectId;
  label: string;
  description?: string;
  type: "food" | "item" | "service";
  requiredQuantity: number;
  currentQuantity: number;
  unit?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const formItemSchema = new Schema<IFormItem>(
  {
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "FormSection",
      required: true,
    },
    label: {
      type: String,
      required: true,
      maxlength: 300,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    type: {
      type: String,
      enum: ["food", "item", "service"],
      default: "item",
    },
    requiredQuantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    currentQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

formItemSchema.index({ sectionId: 1, order: 1 });
formItemSchema.index({ sectionId: 1, isActive: 1 });

export default mongoose.model<IFormItem>("FormItem", formItemSchema);
