import mongoose, { Schema, Document } from "mongoose";

export interface Manufacturer extends Document {
  name: string;
}

const ManufacturerSchema: Schema = new Schema({
  name: { type: String, required: true },
});

export const ManufacturerModel = mongoose.model<Manufacturer>(
  "Manufacturer",
  ManufacturerSchema
);
