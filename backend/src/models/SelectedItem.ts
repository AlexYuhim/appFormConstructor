import mongoose, { Schema, Document } from "mongoose";

export interface ISelectedItem extends Document {
  submissionId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  quantity: number;
  sectionId: mongoose.Types.ObjectId;
}

const selectedItemSchema = new Schema<ISelectedItem>(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "FormItem",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "FormSection",
      required: true,
    },
  },
  {
    timestamps: false,
  },
);

selectedItemSchema.index({ submissionId: 1 });
selectedItemSchema.index({ itemId: 1 });
selectedItemSchema.index({ submissionId: 1, sectionId: 1 }, { unique: true });

export default mongoose.model<ISelectedItem>(
  "SelectedItem",
  selectedItemSchema,
);
