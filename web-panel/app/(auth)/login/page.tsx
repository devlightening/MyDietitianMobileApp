"use client"
import { useState } from "react"
import api from "../../../lib/api"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/api/auth/dietitian/login", { email, password })
      if (res.data.token) {
        window.localStorage.setItem("jwt", res.data.token)
        router.push("/dashboard")
      } else {
        setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
      }
    } catch (err: any) {
      setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-16 bg-white p-8 rounded shadow">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold mb-2">Diyetisyen Girişi</h1>
        <input
          type="email"
          className="border px-3 py-2 rounded"
          placeholder="E-posta"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="border px-3 py-2 rounded"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-accent text-white py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  )
}
