'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-3">
            MultiDB <span className="text-blue-500">Academy</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Plataforma de gestión de bases de datos
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Iniciar Sesión
          </Link>

          <Link
            href="/register"
            className="block w-full py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition border border-gray-700"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}