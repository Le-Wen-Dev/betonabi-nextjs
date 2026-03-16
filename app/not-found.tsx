import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="font-serif text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-muted-foreground mb-8">Trang không tồn tại</p>
        <Link href="/vi" className="text-[#7c3aed] hover:underline">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
