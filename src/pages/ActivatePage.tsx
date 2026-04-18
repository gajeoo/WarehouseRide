import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { AlertCircle, Check, KeyRound, Loader2, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../convex/_generated/api";

export function ActivatePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const tokenData = useQuery(api.activation.validateToken, { token });
  const completeActivation = useMutation(api.activation.completeActivation);
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"form" | "otp" | "activating" | "done">("form");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If user is already authenticated and has a valid token, auto-complete activation
  useEffect(() => {
    if (isAuthenticated && tokenData?.valid && step === "otp") {
      handleCompleteActivation();
    }
  }, [isAuthenticated, tokenData, step]);

  if (!token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Invalid Link</h2>
            <p className="text-muted-foreground">No activation token found. Please check your email for the correct link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenData === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tokenData.valid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Link Unavailable</h2>
            <p className="text-muted-foreground">{tokenData.error}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSignUp = async () => {
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Sign up with email/password — this will trigger OTP
      await signIn("password", {
        email: tokenData.email as string,
        password,
        name: tokenData.name as string,
        flow: "signUp",
      });

      // If signIn returned a redirect (OTP step)
      setStep("otp");
    } catch (err: any) {
      // Check if it's asking for OTP verification
      if (err?.message?.includes("Could not verify") || err?.message?.includes("code")) {
        setStep("otp");
      } else {
        setError(err?.message || "Failed to create account. The email may already be registered — try signing in instead.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await signIn("password", {
        email: tokenData.email as string,
        code: otp,
        flow: "email-verification" as string,
      });
      // After OTP verification, the user is signed in
      // Now complete the activation
      await handleCompleteActivation();
    } catch (err: any) {
      setError(err?.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteActivation = async () => {
    setStep("activating");
    try {
      await completeActivation({ token });
      setStep("done");
      toast.success("Account activated! Welcome to WarehouseRide!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to complete activation.");
      setStep("form");
    }
  };

  const handleSignIn = async () => {
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await signIn("password", {
        email: tokenData.email as string,
        password,
        flow: "signIn",
      });
      await handleCompleteActivation();
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Please check your password.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80">
          <CardContent className="pt-6 text-center">
            <div className="size-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Check className="size-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Account Activated!</h2>
            <p className="text-muted-foreground mb-4">
              Welcome, {tokenData.name}! Your account is ready. Redirecting to your dashboard...
            </p>
            <Loader2 className="size-5 animate-spin text-primary mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "activating") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80">
          <CardContent className="pt-6 text-center">
            <Loader2 className="size-10 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Activating Your Account...</h2>
            <p className="text-muted-foreground">Setting up your profile. Just a moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80">
          <CardHeader className="text-center">
            <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <KeyRound className="size-7 text-primary" />
            </div>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to <strong>{tokenData.email}</strong>. Enter it below to verify your email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Verification Code</Label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="mt-1 text-center text-2xl tracking-[0.3em] font-mono"
                maxLength={6}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="size-3.5" />
                {error}
              </p>
            )}
            <Button onClick={handleVerifyOtp} disabled={loading} className="w-full">
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Verify & Activate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80">
        <CardHeader className="text-center">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <UserCheck className="size-7 text-primary" />
          </div>
          <CardTitle>Activate Your Account</CardTitle>
          <CardDescription>
            Welcome, <strong>{tokenData.name}</strong>! Set your password to complete your registration.
            {tokenData.role === "warehouse_manager" && (
              <span className="block mt-1 text-primary font-medium">
                You're being set up as a Warehouse Manager.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={tokenData.email} disabled className="mt-1 bg-muted" />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="mt-1"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="size-3.5" />
              {error}
            </p>
          )}
          <Button onClick={handleSignUp} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
            Create Account & Activate
          </Button>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignIn} disabled={loading} className="w-full">
            Already have an account? Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
