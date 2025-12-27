"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function DietitianLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error] = useState("E-posta veya şifre hatalı."); // mocked error

  return (
    <Card>
      <h1 className="text-2xl font-bold text-center mb-2">Diyetisyen Girişi</h1>
      <p className="text-center text-muted-foreground mb-4">
        Klinik hesabınıza giriş yapın.
      </p>
      <form className="space-y-4">
        <Input label="E-posta" type="email" placeholder="ornek@klinik.com" required />
        <Input label="Şifre" type="password" placeholder="••••••••" required />
        <div className="flex items-center gap-2">
          <input id="remember" type="checkbox" className="accent-accent" />
          <label htmlFor="remember" className="text-sm text-muted-foreground">
            Beni hatırla
          </label>
        </div>
        {error && <div className="text-danger text-sm">{error}</div>}
        <Button type="submit" className="w-full mt-2" loading={loading} disabled={loading}>
          Giriş Yap
        </Button>
      </form>
      <div className="text-center text-sm mt-4">
        Hesabınız yok mu? <a href="/auth/register" className="text-accent underline">Kayıt Ol</a>
      </div>
    </Card>
  );
}
