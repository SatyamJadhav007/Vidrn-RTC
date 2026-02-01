import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { getProfilePicUrl } from "../lib/profilePic";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon } from "lucide-react";
import { LANGUAGES } from "../constants";
import { onboardingSchema } from "../lib/validationSchemas";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: "",
      bio: "",
      nativeLanguage: "",
      learningLanguage: "",
      location: "",
      profilePic: 1,
    },
  });

  // Watch profilePic for avatar preview
  const profilePic = watch("profilePic");

  // Sync formState when authUser data arrives (fixes timing issue on first navigation)
  useEffect(() => {
    if (authUser) {
      reset({
        fullName: authUser.fullName || "",
        bio: authUser.bio || "",
        nativeLanguage: authUser.nativeLanguage || "",
        learningLanguage: authUser.learningLanguage || "",
        location: authUser.location || "",
        profilePic: authUser.profilePic || 1,
      });
    }
  }, [authUser, reset]);

  // Preload all 8 profile images on component mount for instant avatar switching
  useEffect(() => {
    const preloadImages = () => {
      for (let i = 1; i <= 8; i++) {
        const img = new Image();
        img.loading="eager";
        img.src = getProfilePicUrl(i);
      }
    };
    preloadImages();
  }, []);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const onSubmit = (data) => {
    onboardingMutation(data);
  };

  const handleRandomAvatar = () => {
    const randomNum = Math.floor(Math.random() * 8) + 1; // 1-8 included
    setValue("profilePic", randomNum);
    toast.success("Random profile picture selected!");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Complete Your Profile</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                <img
                  src={getProfilePicUrl(profilePic)}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleRandomAvatar} className="btn btn-accent">
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.fullName ? "input-error" : ""}`}
                placeholder="Your full name"
                {...register("fullName")}
              />
              {errors.fullName && (
                <span className="text-error text-xs mt-1">{errors.fullName.message}</span>
              )}
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                className={`textarea textarea-bordered h-24 ${errors.bio ? "textarea-error" : ""}`}
                placeholder="Tell others about yourself and your language learning goals"
                {...register("bio")}
              />
              {errors.bio && (
                <span className="text-error text-xs mt-1">{errors.bio.message}</span>
              )}
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NATIVE LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  className={`select select-bordered w-full ${errors.nativeLanguage ? "select-error" : ""}`}
                  {...register("nativeLanguage")}
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
                {errors.nativeLanguage && (
                  <span className="text-error text-xs mt-1">{errors.nativeLanguage.message}</span>
                )}
              </div>

              {/* LEARNING LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  className={`select select-bordered w-full ${errors.learningLanguage ? "select-error" : ""}`}
                  {...register("learningLanguage")}
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
                {errors.learningLanguage && (
                  <span className="text-error text-xs mt-1">{errors.learningLanguage.message}</span>
                )}
              </div>
            </div>

            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 ${errors.location ? "input-error" : ""}`}
                  placeholder="City, Country"
                  {...register("location")}
                />
              </div>
              {errors.location && (
                <span className="text-error text-xs mt-1">{errors.location.message}</span>
              )}
            </div>

            {/* SUBMIT BUTTON */}

            <button className="btn btn-primary w-full" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;
