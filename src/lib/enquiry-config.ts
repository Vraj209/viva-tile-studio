/** Public form choices. Confirm this hierarchy with the studio before launch. */
export const enquiryFields = {
  name: { label: "Your name", required: true, maxLength: 120 },
  email: { label: "Email address", required: true, maxLength: 254 },
  idea: { label: "Tell us about your idea", required: true, maxLength: 5000 },
} as const;

export const projectTypes = [
  "Not sure yet",
  "Residential",
  "Commercial",
  "Hospitality",
  "Art & collaboration",
] as const;
export const applications = [
  "Not sure yet",
  "Feature wall",
  "Kitchen",
  "Bathroom",
  "Commercial space",
  "Art installation",
  "Other",
] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const UPLOAD_ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf";
export const UPLOAD_HELP =
  "One JPG, PNG, WebP or PDF, up to 5 MB. Share only artwork you have permission to share.";

export type EnquiryField =
  | "name"
  | "email"
  | "idea"
  | "projectType"
  | "application"
  | "location"
  | "dimensions"
  | "company"
  | "phone"
  | "desiredDate"
  | "inspiration";
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;
