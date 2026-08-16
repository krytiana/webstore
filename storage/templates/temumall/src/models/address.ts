import mongoose, {
  Schema,
  Document
} from "mongoose";

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;

  fullName: string;

  phone: string;

  addressLine: string;

  city: string;

  region: string;

  country: string;

  latitude?: number;

  longitude?: number;

  isDefault?: boolean;

  createdAt?: Date;
}

const AddressSchema = new Schema<IAddress>({
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  fullName: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    trim: true
  },

  addressLine: {
    type: String,
    required: true,
    trim: true
  },

  city: {
    type: String,
    required: true,
    trim: true
  },

  region: {
    type: String,
    required: true,
    trim: true
  },

  country: {
    type: String,
    required: true,
    trim: true
  },

  latitude: Number,

  longitude: Number,

  isDefault: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

export default mongoose.model<IAddress>(
  "Address",
  AddressSchema
);