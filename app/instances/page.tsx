'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../service/api';
import type { DatabaseInstance, StudentInstance } from '../types';
import Link from 'next/link';

export default function InstancesPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [instances, setInstances] = useState<DatabaseInstance[]>([]);
    const [studentInstances, setStudentInstances] = useState<StudentInstance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user) {
            loadInstances();
        }
    }, [authLoading, isAuthenticated, user, router]);

    const loadInstances = async () => {
        if (!user) return;

        setIsLoading(true);
        setError('');

        try {
            if (user.role === 'Student') {
                const data = await apiService.getStudentInstances();
                setStudentInstances(data);
            } else {
                const data = await apiService.getInstances();
                setInstances(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar instancias');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                    <p className="text-gray-400 mt-4 animate-pulse">Cargando instancias...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-black">
            {/* Navbar */}
            <nav className="bg-gray-900 border-b border-gray-800 backdrop-blur-lg bg-opacity-90 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        MultiDB Academy
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">{user.name}</span>
                        <Link href="/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all">
                            Volver al Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8 animate-fade-in-down">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {user.role === 'Student' ? 'Mis Instancias Asignadas' : 'Instancias de Base de Datos'}
                        </h1>
                        <p className="text-gray-400">
                            {user.role === 'Student'
                                ? 'Instancias disponibles para ejecutar queries'
                                : 'Gestiona todas las instancias del sistema'}
                        </p>
                    </div>

                    {(user.role === 'Teacher' || user.role === 'Admin') && (
                        <Link href="/instances/create" className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105">
                            + Nueva Instancia
                        </Link>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 animate-fade-in">
                        {error}
                    </div>
                )}

                {/* Student View */}
                {user.role === 'Student' && (
                    <div className="animate-fade-in-up">
                        {studentInstances.length === 0 ? (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-gray-300 text-lg font-semibold mb-2">No tienes instancias asignadas</p>
                                <p className="text-gray-500 text-sm">Contacta a tu profesor para obtener acceso</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {studentInstances.map((instance) => (
                                    <div key={instance.instanceId} className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500 transition-all duration-300 transform hover:scale-105">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-1">
                                                    {instance.instanceName}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Asignado: {new Date(instance.assignedAt).toLocaleDateString('es-ES')}
                                                </p>
                                            </div>
                                            <span className="bg-green-900 bg-opacity-50 text-green-300 text-xs font-semibold px-3 py-1 rounded-full border border-green-500">
                                                Activo
                                            </span>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-800">
                                            <Link
                                                href={`/student/queries?instanceId=${instance.instanceId}`}
                                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/50"
                                            >
                                                Ejecutar Queries
                                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Teacher/Admin View */}
                {(user.role === 'Teacher' || user.role === 'Admin') && (
                    <div className="animate-fade-in-up">
                        {instances.length === 0 ? (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                    </svg>
                                </div>
                                <p className="text-gray-300 text-lg font-semibold mb-2">No hay instancias creadas</p>
                                <p className="text-gray-500 text-sm mb-6">Crea tu primera instancia para comenzar</p>
                                <Link href="/instances/create" className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all">
                                    Crear Primera Instancia
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-800">
                                        <thead className="bg-gray-800">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                    Nombre
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                    Servidor
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                    Puerto
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                    Base de Datos
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                    Estado
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                    Creado
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {instances.map((instance) => (
                                                <tr key={instance.id} className="hover:bg-gray-800 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-white">{instance.name}</div>
                                                        <div className="text-sm text-gray-500">ID: {instance.id.slice(0, 8)}...</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {instance.server}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {instance.port}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {instance.databaseName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {instance.isActive ? (
                                                            <span className="bg-green-900 bg-opacity-50 text-green-300 text-xs font-semibold px-3 py-1 rounded-full border border-green-500">
                                                                Activo
                                                            </span>
                                                        ) : (
                                                            <span className="bg-red-900 bg-opacity-50 text-red-300 text-xs font-semibold px-3 py-1 rounded-full border border-red-500">
                                                                Inactivo
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(instance.createdAt).toLocaleDateString('es-ES')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}