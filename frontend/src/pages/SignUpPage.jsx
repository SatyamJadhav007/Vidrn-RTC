import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShipWheelIcon, Eye, EyeOff } from "lucide-react";
import useSignUp from "../hooks/useSignUp";
import { Link } from "react-router";
import { signUpSchema } from "../lib/validationSchemas";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { isPending, error, signupMutation } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      termsAccepted: false,
    },
  });

  const onSubmit = (data) => {
    // Extract only the fields needed for the API (exclude termsAccepted)
    const { termsAccepted, ...signupData } = data;
    signupMutation(signupData);
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-indigo-500" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500 tracking-wider">
              Vidrn
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-indigo-400">
                    Create an Account
                  </h2>
                  <p className="text-sm opacity-70">
                    Join Vidrn and start your language learning adventure!
                  </p>
                </div>

                <div className="space-y-3">
                  {/* FULLNAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text text-indigo-300">
                        Full Name
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className={`input input-bordered w-full ${errors.fullName ? "input-error" : ""}`}
                      {...register("fullName")}
                    />
                    {errors.fullName && (
                      <span className="text-error text-xs mt-1">
                        {errors.fullName.message}
                      </span>
                    )}
                  </div>
                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text text-indigo-300">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                      {...register("email")}
                    />
                    {errors.email && (
                      <span className="text-error text-xs mt-1">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text text-indigo-300">
                        Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        className={`input input-bordered w-full pr-10 ${errors.password ? "input-error" : ""}`}
                        {...register("password")}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <p className="text-xs opacity-70 mt-1 text-indigo-300/70">
                      Password must be at least 6 characters long
                    </p>
                    {errors.password && (
                      <span className="text-error text-xs mt-1">
                        {errors.password.message}
                      </span>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        className={`checkbox checkbox-sm ${errors.termsAccepted ? "checkbox-error" : ""}`}
                        {...register("termsAccepted")}
                      />
                      <span className="text-xs leading-tight text-base-content/80">
                        I agree to the{" "}
                        <span className="text-indigo-500 hover:text-violet-500 hover:underline">
                          terms of service
                        </span>{" "}
                        and{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500 hover:underline">
                          privacy policy
                        </span>
                      </span>
                    </label>
                    {errors.termsAccepted && (
                      <span className="text-error text-xs mt-1">
                        {errors.termsAccepted.message}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="btn w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-none hover:from-indigo-600 hover:to-violet-600"
                  type="submit"
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500 hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
        <div
          className="hidden lg:flex w-full lg:w-1/2 bg-indigo-500/10
 items-center justify-center"
        >
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/i.png"
                alt="Language connection illustration"
                className="w-full h-full"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with language partners worldwide
              </h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language
                skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
