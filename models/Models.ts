import mongoose, { Schema, Document } from "mongoose";

export interface CarModel extends Document {
  name: string;
  manufacturer: mongoose.Types.ObjectId;
}

const CarModelSchema: Schema = new Schema({
  name: { type: String, required: true },
  manufacturer: {
    type: Schema.Types.ObjectId,
    ref: "Manufacturer",
    required: true,
  },
});

export const CarModelModel = mongoose.model<CarModel>(
  "CarModel",
  CarModelSchema
);
