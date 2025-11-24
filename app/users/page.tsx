'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../service/api';
import type { User, StudentInstance } from '../types';

// No hay endpoint para desasignar; solo mostramos info y un botón deshabilitado.

export default function UsersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Record<string, StudentInstance[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'Admin') {
      router.push('/dashboard');
      return;
    }
    if (user) {
      loadData();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const userList = await apiService.getUsers();
      setUsers(userList);

      // cargar instancias por usuario (solo estudiantes)
      const entries = await Promise.all(
        userList.map(async (u) => {
          if ((u as any).roleId === 2) {
            try {
              const inst = await apiService.getStudentInstances(String(u.id));
              return [String(u.id), inst] as const;
            } catch {
              return [String(u.id), []] as const;
            }
          }
          return [String(u.id), []] as const;
        })
      );

      const map: Record<string, StudentInstance[]> = {};
      entries.forEach(([id, inst]) => {
        map[id] = inst;
      });
      setAssignments(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 mt-4 animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'Admin') return null;

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-gray-900 border-b border-gray-800 backdrop-blur-lg bg-opacity-90 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
          >
            MultiDB Academy
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user.name}</span>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
            >
              Volver
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-down flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Usuarios</h1>
            <p className="text-gray-400">Lista de usuarios y sus instancias asignadas</p>
          </div>
          <Link
            href="/instances"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
          >
            Ver instancias
          </Link>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Instancias asignadas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((u) => {
                  const roleName = (u as any).roleId === 1 ? 'Admin' : 'Student';
                  const inst = assignments[String(u.id)] ?? [];
                  return (
                    <tr key={u.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-white">{u.name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{roleName}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {roleName === 'Admin' ? (
                          <span className="text-gray-500 text-xs">No aplica</span>
                        ) : inst.length === 0 ? (
                          <span className="text-gray-500 text-xs">Sin instancias</span>
                        ) : (
                          <ul className="space-y-2">
                            {inst.map((i, idx) => (
                              <li key={`${i.instanceId ?? idx}`} className="flex items-center justify-between">
                                <span className="text-sm text-white">
                                  {i.instanceName ?? `Instancia ${idx + 1}`}
                                </span>
                                <button
                                  disabled
                                  className="text-xs px-2 py-1 bg-gray-800 border border-gray-700 text-gray-500 rounded cursor-not-allowed"
                                  title="No hay endpoint para desasignar en el backend"
                                >
                                  Desasignar
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <span className="text-xs text-gray-500">Sin acciones adicionales</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
