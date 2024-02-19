import mongoose, { Schema, Document } from "mongoose";

export interface Model extends Document {
  name: string;
  manufacturer: mongoose.Types.ObjectId;
}

const ModelSchema: Schema = new Schema({
  name: { type: String, required: true },
  manufacturer: {
    type: Schema.Types.ObjectId,
    ref: "Manufacturer",
    required: true,
  },
});

export default mongoose.model<Model>("Model", ModelSchema);
