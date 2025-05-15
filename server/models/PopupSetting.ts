import mongoose, { Schema, Document } from 'mongoose';

export interface IPopupSetting extends Document {
  enabled: boolean;
  startDate: string;
  endDate: string;
  bgImage: string;
}

const PopupSettingSchema = new Schema<IPopupSetting>({
  enabled: { type: Boolean, default: false },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  bgImage: { type: String, default: '' },
});

export default mongoose.models.PopupSetting || mongoose.model<IPopupSetting>('PopupSetting', PopupSettingSchema);
