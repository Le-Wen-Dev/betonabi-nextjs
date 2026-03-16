import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { pb } from "@/lib/pb";

type LocationState = {
  from?: { pathname?: string };
  requiredRole?: "admin" | "author" | "user" | "staff";
};

function isAdminPath(pathname?: string) {
  return typeof pathname === "string" && pathname.startsWith("/admin");
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ready, isAuthenticated, isAdmin, isAuthor, user, loginWithPassword } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hintToastShownRef = useRef(false);

  const { fromPathname, requiredRole } = useMemo(() => {
    const state = (location.state || {}) as LocationState;
    return {
      fromPathname: state.from?.pathname,
      requiredRole: state.requiredRole,
    };
  }, [location.state]);

  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    if (isAuthor) {
      navigate("/admin/articles", { replace: true });
      return;
    }
    navigate("/user/dashboard", { replace: true });
  }, [ready, isAuthenticated, isAdmin, isAuthor, navigate]);

  useEffect(() => {
    if (hintToastShownRef.current) return;
    if (requiredRole === "admin" || isAdminPath(fromPathname)) {
      toast({
        title: "Yêu cầu quyền Admin",
        description: "Vui lòng đăng nhập bằng tài khoản Admin để tiếp tục.",
      });
      hintToastShownRef.current = true;
    }
    if (requiredRole === "staff") {
      toast({
        title: "Yêu cầu quyền quản trị nội dung",
        description: "Vui lòng đăng nhập bằng tài khoản Admin/Author để tiếp tục.",
      });
      hintToastShownRef.current = true;
    }
  }, [requiredRole, fromPathname]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (mode === "register") {
        if (password !== passwordConfirm) {
          const msg = "Mật khẩu xác nhận không khớp.";
          setError(msg);
          toast({ title: "Đăng ký thất bại", description: msg, variant: "destructive" });
          return;
        }

        await pb.collection("users").create({
          email: email.trim(),
          password,
          passwordConfirm,
          name: name.trim(),
          role: "user",
          // để email luôn hiển thị với người khác (vd. admin list)
          emailVisibility: true,
        });

        await loginWithPassword(email.trim(), password);

        // PocketBase: emailVisibility thường chỉ có hiệu lực khi update bởi chính chủ.
        // Set lại sau khi đã login để đảm bảo admin list thấy email.
        try {
          const id = (pb.authStore.model as any)?.id as string | undefined;
          if (id) {
            await pb.collection("users").update(id, { emailVisibility: true });
          }
        } catch {
          // ignore
        }
        toast({
          title: "Đăng ký thành công",
          description: "Tài khoản đã được tạo và đăng nhập.",
        });
        navigate("/user/dashboard", { replace: true });
        return;
      }

      const u = await loginWithPassword(email.trim(), password);
      toast({
        title: "Đăng nhập thành công",
        description:
          u.role === "admin" ? "Chào mừng Admin." : u.role === "author" ? "Chào mừng Author." : "Chào mừng bạn quay trở lại.",
      });

      // Điều hướng theo role. Nếu "from" là /admin mà user không phải admin thì bỏ qua from.
      if (u.role === "admin") {
        navigate(fromPathname || "/admin/dashboard", { replace: true });
        return;
      }

      if (u.role === "author") {
        // staff pages live under /admin/*
        navigate(fromPathname || "/admin/articles", { replace: true });
        return;
      }

      if (requiredRole === "admin" || requiredRole === "staff" || isAdminPath(fromPathname)) {
        navigate("/user/dashboard", { replace: true });
        return;
      }

      navigate(fromPathname || "/user/dashboard", { replace: true });
    } catch (err: any) {
      const msg =
        typeof err?.message === "string"
          ? err.message
          : mode === "register"
            ? "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại."
            : "Đăng nhập thất bại. Vui lòng kiểm tra email/mật khẩu.";
      setError(msg);
      toast({
        title: mode === "register" ? "Đăng ký thất bại" : "Đăng nhập thất bại",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="font-serif text-3xl font-bold text-foreground">
            Betonabi
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Đăng nhập để tiếp tục
            {user?.email ? ` (${user.email})` : ""}
          </p>
        </div>

        <Card className="rounded-none border-foreground/20">
          <CardHeader>
            <CardTitle className="font-serif">{mode === "login" ? "Đăng nhập" : "Đăng ký"}</CardTitle>
            <CardDescription>
              {mode === "login" ? "Đăng nhập vào tài khoản của bạn." : "Chỉ user được phép tự đăng ký."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                type="button"
                variant={mode === "login" ? "default" : "outline"}
                className={mode === "login" ? "rounded-none" : "rounded-none border-foreground/20"}
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
              >
                Đăng nhập
              </Button>
              <Button
                type="button"
                variant={mode === "register" ? "default" : "outline"}
                className={mode === "register" ? "rounded-none" : "rounded-none border-foreground/20"}
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
              >
                Đăng ký
              </Button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Tên hiển thị</Label>
                  <Input
                    id="name"
                    type="text"
                    autoComplete="off"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Minh"
                    className="rounded-none border-foreground/20"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="rounded-none border-foreground/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-none border-foreground/20"
                  required
                />
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Xác nhận mật khẩu</Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    autoComplete="off"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="rounded-none border-foreground/20"
                    required
                  />
                </div>
              )}

              {error && <div className="text-sm text-destructive">{error}</div>}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none font-medium"
              >
                {isSubmitting ? (mode === "login" ? "Đang đăng nhập..." : "Đang đăng ký...") : mode === "login" ? "Đăng nhập" : "Đăng ký"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground underline underline-offset-4">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

