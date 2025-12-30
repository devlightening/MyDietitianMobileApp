"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function DietitianRegisterPage() {
  const [values, setValues] = useState({ fullName: '', clinicName: '', email: '', password: '' });
  const [errors, setErrors] = useState({ fullName: '', clinicName: '', email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: any = {};
    if (!values.fullName.trim()) errs.fullName = "Ad Soyad zorunludur.";
    if (!values.clinicName.trim()) errs.clinicName = "Klinik adı zorunludur.";
    if (!values.email.trim()) errs.email = "E-posta zorunludur.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errs.email = "Geçerli bir e-posta girin.";
    if (!values.password) errs.password = "Şifre zorunludur.";
    else if (values.password.length < 8) errs.password = "En az 8 karakter olmalı.";
    else if (!/[A-Z]/.test(values.password)) errs.password = "Bir büyük harf içermeli.";
    else if (!/[0-9]/.test(values.password)) errs.password = "Bir rakam içermeli.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const dto = {
        fullName: values.fullName.trim(),
        clinicName: values.clinicName.trim(),
        email: values.email.trim(),
        password: values.password
      };
      const res = await fetch("/api/auth/dietitian/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Kayıt başarısız oldu.");
      }
      setApiError('');
      setLoading(false);
      window.location.href = "/auth/login";
    } catch (err: any) {
      setApiError(err?.message || "Kayıt başarısız oldu.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">Diyetisyen Kayıt</h1>
        <p className="text-center text-muted-foreground mb-4 text-base">
          Klinik paneline hoşgeldiniz. Lütfen bilgilerinizi doldurun.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Ad Soyad"
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            error={submitted && errors.fullName}
            required
            className="text-base"
          />
          <Input
            label="Klinik Adı"
            name="clinicName"
            value={values.clinicName}
            onChange={handleChange}
            error={submitted && errors.clinicName}
            required
            className="text-base"
          />
          <Input
            label="E-posta"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={submitted && errors.email}
            required
            className="text-base"
          />
          <Input
            label="Şifre"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={submitted && errors.password}
            required
            helperText="En az 8 karakter, bir büyük harf ve bir rakam"
            className="text-base"
          />
          {apiError && <div className="text-danger text-sm mt-2">{apiError}</div>}
          <Button type="submit" className="w-full mt-2" loading={loading} disabled={loading}>
            Kayıt Ol
          </Button>
        </form>
        <div className="text-center text-sm mt-4">
          Zaten hesabınız var mı? <a href="/auth/login" className="text-primary hover:underline font-medium">Giriş Yap</a>
        </div>
      </Card>
    </div>
  );
}
