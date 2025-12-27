"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ClientAccessPage() {
  const [error] = useState("Anahtar bulunamadı."); // mocked error
  return (
    <Card>
      <h1 className="text-2xl font-bold text-center mb-2">Erişim Anahtarı ile Giriş</h1>
      <p className="text-center text-muted-foreground mb-4">
        Diyetisyeninizden aldığınız erişim anahtarını girin.<br />
        <span className="text-xs text-muted-foreground">
          Anahtarınız yoksa lütfen diyetisyeninize başvurun.
        </span>
      </p>
      <form className="space-y-4">
        <Input label="Erişim Anahtarı" placeholder="XXXX-XXXX-XXXX" required error={error} />
        <Button type="submit" className="w-full mt-2">
          Giriş Yap
        </Button>
      </form>
      <div className="text-center text-sm mt-4">
        <a href="/auth/login" className="text-accent underline">Diyetisyen Girişi</a>
      </div>
    </Card>
  );
}
