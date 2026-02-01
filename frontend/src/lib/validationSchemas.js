import { z } from "zod";

// SignUp Page Schema
export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72,"Password must be less then 72 characters")
    ,
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must accept the terms of service and privacy policy",
    }),
});

// Login Page Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required") 
    .max(72,"Password must be less then 72 characters")
    ,
});

// Onboarding Page Schema
export const onboardingSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters"),
    bio: z
      .string()
      .max(500, "Bio must be less than 500 characters")
      .optional()
      .or(z.literal("")),
    nativeLanguage: z
      .string()
      .min(1, "Please select your native language"),
    learningLanguage: z
      .string()
      .min(1, "Please select the language you're learning"),
    location: z
      .string()
      .max(100, "Location must be less than 100 characters")
      .optional()
      .or(z.literal("")),
    profilePic: z
      .number()
      .min(1, "Profile picture must be between 1 and 8")
      .max(8, "Profile picture must be between 1 and 8"),
  })
  .refine((data) => data.nativeLanguage !== data.learningLanguage, {
    message: "Native and learning languages must be different",
    path: ["learningLanguage"],
  });
