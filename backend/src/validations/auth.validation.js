import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72,"Password must be less then 72 characters"),
  fullName: z.string().min(1, "Full name is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required").max(72,"Password must be less then 72 characters"),
});

export const onboardSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  bio: z.string().min(1, "Bio is required"),
  nativeLanguage: z.string().min(1, "Native language is required"),
  learningLanguage: z.string().min(1, "Learning language is required"),
  location: z.string().min(1, "Location is required"),
});
