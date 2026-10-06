import React from "react";
import AuthLaout from "./AuthLaout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "./authSchemas";
import { Label } from "../../components/ui/label";
import { User } from "lucide-react";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import { Mail } from "lucide-react";
import { Lock, Phone } from "lucide-react";
import { ROLES } from "../../lib/constants";

import RoleButton from "./RoleButton";
import { Button } from "../../components/ui/button";
import { ArrowRight } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { registerUser } from "../../reduxt-store/user/userThunk";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearAuthError } from "../../reduxt-store/user/userSlice";

const Register = () => {
  const { isAuthenticated, user, isLoading, error } = useSelector((state) => state.auth);
  const navigate=useNavigate();
  const dispatch=useDispatch()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      role: ROLES.JOB_SEEKER,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    dispatch(registerUser(data));
  };

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

    useEffect(() => {
      if (isAuthenticated && user) {
        navigate("/");
      }
    }, [isAuthenticated, user]);

  return (
    <AuthLaout
      title={"Create your account"}
      description={"Start your AI-powered job search journey"}
      footerText={"Already have an account? "}
      footerLinkText={"Login"}
      footerLink={"/login"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="space-y-2">
          <Label>Full Name</Label>

          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <User className="h-4 w-4" />
            </div>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              {...register("fullName")}
              className={cn(
                "pl-10 h-11 transition-all",
                errors.fullName
                  ? "border-red-300 focus-visible:ring-red-500"
                  : "focus-visible:ring-primary focus-visible:border-primary",
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email Address</Label>

          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="email"
              type={"email"}
              placeholder="you@jobnova.com"
              {...register("email")}
              className={cn(
                "pl-10 h-11 transition-all",
                errors.email
                  ? "border-red-300 focus-visible:ring-red-500"
                  : "focus-visible:ring-primary focus-visible:border-primary",
              )}
            />
          </div>
          {errors.email && <p className="text-xs text-red-600 mt-1.5">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Phone Number <span className="text-slate-400 font-normal">(optional)</span></Label>

          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Phone className="h-4 w-4" />
            </div>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+91 98765 43210"
              {...register("phoneNumber")}
              className={cn(
                "pl-10 h-11 transition-all",
                errors.phoneNumber
                  ? "border-red-300 focus-visible:ring-red-500"
                  : "focus-visible:ring-primary focus-visible:border-primary",
              )}
            />
          </div>
          {errors.phoneNumber && <p className="text-xs text-red-600 mt-1.5">{errors.phoneNumber.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Password</Label>

          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="password"
              type={"password"}
              placeholder="provide your password"
              {...register("password")}
              className={cn(
                "pl-10 h-11 transition-all",
                errors.password
                  ? "border-red-300 focus-visible:ring-red-500"
                  : "focus-visible:ring-primary focus-visible:border-primary",
              )}
            />
          </div>

          {errors.password && <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1.5 animate-in slide-in-from-top-1">
            <AlertCircle className="h-3 w-3" />
            {errors.password.message}</p>}


        </div>

        <div className="space-y-2">
          <Label>Confirm Password</Label>

          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="confirm your password"
              {...register("confirmPassword")}
              className={cn(
                "pl-10 h-11 transition-all",
                errors.confirmPassword
                  ? "border-red-300 focus-visible:ring-red-500"
                  : "focus-visible:ring-primary focus-visible:border-primary",
              )}
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-600 mt-1.5">{errors.confirmPassword.message}</p>}
        </div>

        <div className="space-y-3">
          <Label>I am a</Label>
          <div className="grid grid-cols-2 gap-3">
            <RoleButton
              selectedRole={selectedRole}
              setValue={setValue}
              name={"Job Seeker"}
              description={"Find your dream job"}
              role={ROLES.JOB_SEEKER}
            />
            <RoleButton
              selectedRole={selectedRole}
              setValue={setValue}
              name={"Employer"}
              description={"Hire top talent"}
              role={ROLES.EMPLOYER}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full  shadow-md hover:shadow-lg">
            {isLoading ? "Creating account..." : "Register"}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform"/>
        </Button>
      </form>
    </AuthLaout>
  );
};

export default Register;
