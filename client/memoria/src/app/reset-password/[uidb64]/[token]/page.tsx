"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/src/components/navbar"

export default function ResetPassword() {
  const { uidb64, token } = useParams() as { uidb64: string; token: string };
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('The passwords do not match!');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/auth/reset-password/${uidb64}/${token}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Reset password successfully!');
        setTimeout(() => router.push('/login/'), 2000);
      } else {
        setError(data.error || 'The link is not valid or has been expired!');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred!');
    }
  };

  return (
    <main>
      <Navbar />
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl font-bold text-green-500 mb-6 text-center">Forget password?</h1>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
              <div>
                <label htmlFor="password" className="block mb-1">Password</label>
                <input
                  type='password'
                  name="password"
                  className='input-field'
                  placeholder='Enter your new password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className='mt-4'>
                <label htmlFor="confirmPassword" className="block mb-1">Confirm password</label>
                <input
                  type='password'
                  name="confirmPassword"
                  className='input-field'
                  placeholder='Confirm your new password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-500 text-sm">{message}</p>}

              <button type="submit" className="w-full btn-primary py-2 mt-4">Create new password</button>
            </form>
          </div>

          <div className="w-full md:w-1/2 flex justify-center">
            <img src="/flashcard_illustration.png" alt="Illustration" className="max-w-full h-auto" />
          </div>
        </div>
      </div>
    </main>
  );
}