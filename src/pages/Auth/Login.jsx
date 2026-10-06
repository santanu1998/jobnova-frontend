import React from "react";
import AuthLaout from "./AuthLaout";
import { Label } from "../../components/ui/label";
import { Mail } from "lucide-react";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "./authSchemas";
import { Lock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginUser } from "../../reduxt-store/user/userThunk";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthError } from "../../reduxt-store/user/userSlice";
import { useSelector } from "react-redux";
import { getRoleBasedRedirect } from "../../utils/roleRedirect";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    dispatch(loginUser(data));
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
      title={"Welcome back"}
      description={"Sign in to continue your job search journey"}
      footerText={"Don't have an account? "}
      footerLinkText={"Create account"}
      footerLink={"/register"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
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
        </div>
        <Button type="submit" disabled={isLoading} className="w-full  shadow-md hover:shadow-lg">
          {isLoading ? "Signing in..." : "Sign In"}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </form>
    </AuthLaout>
  );
};

export default Login;
