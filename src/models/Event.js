import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    date: {
      type: Date,
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled"],
      default: "draft"
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;