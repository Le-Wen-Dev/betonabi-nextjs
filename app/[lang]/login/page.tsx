'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { pb } from '@/lib/pb';
import { localePath } from '@/lib/navigation';

function isAdminPath(pathname?: string) {
  return typeof pathname === 'string' && pathname.startsWith('/admin');
}

export default function LoginPage() {
  const router = useRouter();
  const params = useParams<{ lang: string }>();
  const locale = params?.lang || 'vi';
  const { ready, isAuthenticated, isAdmin, isAuthor, user, loginWithPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hintToastShownRef = useRef(false);

  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    if (isAdmin) { router.replace(localePath(locale, '/admin/dashboard')); return; }
    if (isAuthor) { router.replace(localePath(locale, '/admin/articles')); return; }
    router.replace(localePath(locale, '/user/dashboard'));
  }, [ready, isAuthenticated, isAdmin, isAuthor, router, locale]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (mode === 'register') {
        if (password !== passwordConfirm) {
          const msg = 'Mật khẩu xác nhận không khớp.';
          setError(msg);
          toast({ title: 'Đăng ký thất bại', description: msg, variant: 'destructive' });
          return;
        }

        await pb.collection('users').create({
          email: email.trim(),
          password,
          passwordConfirm,
          name: name.trim(),
          role: 'user',
          emailVisibility: true,
        });

        await loginWithPassword(email.trim(), password);

        try {
          const id = (pb.authStore.model as any)?.id as string | undefined;
          if (id) await pb.collection('users').update(id, { emailVisibility: true });
        } catch { /* ignore */ }

        toast({ title: 'Đăng ký thành công', description: 'Tài khoản đã được tạo và đăng nhập.' });
        router.replace(localePath(locale, '/user/dashboard'));
        return;
      }

      const u = await loginWithPassword(email.trim(), password);
      toast({
        title: 'Đăng nhập thành công',
        description: u.role === 'admin' ? 'Chào mừng Admin.' : u.role === 'author' ? 'Chào mừng Author.' : 'Chào mừng bạn quay trở lại.',
      });

      if (u.role === 'admin') { router.replace(localePath(locale, '/admin/dashboard')); return; }
      if (u.role === 'author') { router.replace(localePath(locale, '/admin/articles')); return; }
      router.replace(localePath(locale, '/user/dashboard'));
    } catch (err: any) {
      const msg = typeof err?.message === 'string'
        ? err.message
        : mode === 'register'
          ? 'Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.'
          : 'Đăng nhập thất bại. Vui lòng kiểm tra email/mật khẩu.';
      setError(msg);
      toast({
        title: mode === 'register' ? 'Đăng ký thất bại' : 'Đăng nhập thất bại',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href={localePath(locale, '/')} className="font-serif text-3xl font-bold text-foreground">
            Betonabi
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Đăng nhập để tiếp tục{user?.email ? ` (${user.email})` : ''}
          </p>
        </div>

        <Card className="rounded-none border-foreground/20">
          <CardHeader>
            <CardTitle className="font-serif">{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</CardTitle>
            <CardDescription>
              {mode === 'login' ? 'Đăng nhập vào tài khoản của bạn.' : 'Chỉ user được phép tự đăng ký.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                type="button"
                variant={mode === 'login' ? 'default' : 'outline'}
                className={mode === 'login' ? 'rounded-none' : 'rounded-none border-foreground/20'}
                onClick={() => { setMode('login'); setError(null); }}
              >
                Đăng nhập
              </Button>
              <Button
                type="button"
                variant={mode === 'register' ? 'default' : 'outline'}
                className={mode === 'register' ? 'rounded-none' : 'rounded-none border-foreground/20'}
                onClick={() => { setMode('register'); setError(null); }}
              >
                Đăng ký
              </Button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Tên hiển thị</Label>
                  <Input
                    id="name" type="text" autoComplete="off" value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Minh" className="rounded-none border-foreground/20" required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email" type="email" autoComplete="off" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com" className="rounded-none border-foreground/20" required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password" type="password" autoComplete="off" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-none border-foreground/20" required
                />
              </div>
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Xác nhận mật khẩu</Label>
                  <Input
                    id="passwordConfirm" type="password" autoComplete="off" value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="rounded-none border-foreground/20" required
                  />
                </div>
              )}
              {error && <div className="text-sm text-destructive">{error}</div>}
              <Button
                type="submit" disabled={isSubmitting}
                className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none font-medium"
              >
                {isSubmitting
                  ? (mode === 'login' ? 'Đang đăng nhập...' : 'Đang đăng ký...')
                  : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link href={localePath(locale, '/')} className="hover:text-foreground underline underline-offset-4">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
