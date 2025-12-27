// /app/auth/register/page.tsx
"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function DietitianRegisterPage() {
  const [loading, setLoading] = useState(false);
  return (
    <Card>
      <h1 className="text-2xl font-bold text-center mb-2">Diyetisyen Kayıt</h1>
      <p className="text-center text-muted-foreground mb-4">
        Klinik paneline hoşgeldiniz. Lütfen bilgilerinizi doldurun.
      </p>
      <form className="space-y-4">
        <Input label="Ad Soyad" placeholder="Adınızı girin" required />
        <Input label="Klinik Adı" placeholder="Klinik adınızı girin" required />
        <Input label="E-posta" type="email" placeholder="ornek@klinik.com" required error="Geçersiz e-posta" />
        <Input label="Şifre" type="password" placeholder="••••••••" required helperText="En az 8 karakter" />
        <div className="text-danger text-sm">Tüm alanlar zorunludur.</div>
        <Button type="submit" className="w-full mt-2" loading={loading} disabled={loading}>
          Kayıt Ol
        </Button>
      </form>
      <div className="text-center text-sm mt-4">
        Zaten hesabınız var mı? <a href="/auth/login" className="text-accent underline">Giriş Yap</a>
      </div>
    </Card>
  );
}