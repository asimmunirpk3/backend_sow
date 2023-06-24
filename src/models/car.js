import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    category:{type:mongoose.Schema.Types.ObjectId, ref:'Category'},
    name: { type: String, required: true },
    color: { type: String, required: true },
    model: { type: String, required: true },
    make: { type: String, required: true },
    registration: { type: String, required: true },
  },
{
  timestamps: true
}

);

export const carModel = mongoose.model("Car", carSchema);
