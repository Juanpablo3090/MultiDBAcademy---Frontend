'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push('/login');
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                    <p className="text-gray-400 mt-4 animate-pulse">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const roleColors = {
        Student: 'from-blue-500 to-cyan-500',
        Admin: 'from-red-500 to-orange-500'
    } as const;

    return (
        <div className="min-h-screen bg-black">
            {/* Navbar Moderna */}
            <nav className="bg-gray-900 border-b border-gray-800 backdrop-blur-lg bg-opacity-90 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            MultiDB Academy
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm text-gray-400">Bienvenido</p>
                                <p className="text-white font-semibold">{user.name}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${roleColors[user.role]} bg-opacity-20 border border-opacity-30`}>
                                <span className="text-xs font-semibold text-white">{user.role}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 border border-gray-700 hover:border-gray-600"
                            >
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-black border-b border-gray-800">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-16">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 animate-fade-in-down">
                        Bienvenido, {user.name}
                    </h2>
                    <p className="text-xl text-gray-400 animate-fade-in-up animation-delay-200">
                        {user.role === 'Student' && 'Explora tus instancias y ejecuta queries SQL'}
                        {user.role === 'Admin' && 'Control total del sistema'}
                    </p>
                </div>
            </div>

            {/* Dashboard Cards */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {user.role === 'Student' && (
                        <>
                            <Link href="/student/queries" className="group">
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Mis Queries</h3>
                                    <p className="text-gray-400 text-sm">Ejecuta consultas SQL en tus instancias</p>
                                    <div className="mt-4 flex items-center text-blue-400 text-sm font-semibold">
                                        Abrir <span className="ml-2 group-hover:ml-4 transition-all">?</span>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/instances" className="group">
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Mis Instancias</h3>
                                    <p className="text-gray-400 text-sm">Ver instancias asignadas</p>
                                    <div className="mt-4 flex items-center text-purple-400 text-sm font-semibold">
                                        Abrir <span className="ml-2 group-hover:ml-4 transition-all">?</span>
                                    </div>
                                </div>
                            </Link>
                        </>
                    )}

                    {user.role === 'Admin' && (
                        <>
                            <Link href="/instances/create" className="group">
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Crear Instancia</h3>
                                    <p className="text-gray-400 text-sm">Nueva instancia de base de datos</p>
                                    <div className="mt-4 flex items-center text-green-400 text-sm font-semibold">
                                        Crear <span className="ml-2 group-hover:ml-4 transition-all">?</span>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/instances/assign" className="group">
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
                                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Asignar Instancia</h3>
                                    <p className="text-gray-400 text-sm">Asignar a estudiantes</p>
                                    <div className="mt-4 flex items-center text-yellow-400 text-sm font-semibold">
                                        Asignar <span className="ml-2 group-hover:ml-4 transition-all">?</span>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/instances" className="group">
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Ver Instancias</h3>
                                    <p className="text-gray-400 text-sm">Administrar todas las instancias</p>
                                    <div className="mt-4 flex items-center text-blue-400 text-sm font-semibold">
                                        Ver todo <span className="ml-2 group-hover:ml-4 transition-all">?</span>
                                    </div>
                                </div>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}