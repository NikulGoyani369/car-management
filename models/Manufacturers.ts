import mongoose, { Schema, Document } from "mongoose";

export interface Manufacturer extends Document {
  name: string;
}

export interface CarModel extends Document {
  name: string;
  manufacturer: mongoose.Types.ObjectId;
}

const ManufacturerSchema: Schema = new Schema({
  name: { type: String, required: true },
});

const CarModelSchema: Schema = new Schema({
  name: { type: String, required: true },
  manufacturer: {
    type: Schema.Types.ObjectId,
    ref: "Manufacturer",
    required: true,
  },
});

export const ManufacturerModel = mongoose.model<Manufacturer>(
  "Manufacturer",
  ManufacturerSchema
);

export const CarModelModel = mongoose.model<CarModel>(
  "CarModel",
  CarModelSchema
);
