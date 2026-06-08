import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
  formId: mongoose.Types.ObjectId;
  userName: string;
  userSurname: string;
  consentGiven: boolean;
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  customText?: string;
}

const submissionSchema = new Schema<ISubmission>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    userName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    userSurname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    consentGiven: {
      type: Boolean,
      required: true,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    customText: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: false,
  },
);

submissionSchema.index({ formId: 1, submittedAt: -1 });
submissionSchema.index({ formId: 1, userName: 1, userSurname: 1 });

export default mongoose.model<ISubmission>("Submission", submissionSchema);
