'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../service/api';
import {
    validateInstanceName,
    validateServer,
    validatePort,
    validateDatabaseName,
    validateUsername,
    validatePassword,
    validateForm,
} from '../../types/validators';
import type { FormErrors, UserRole } from '../../types';
import Link from 'next/link';

const ALLOWED_ROLES: UserRole[] = ['Teacher', 'Admin'];

export default function CreateInstancePage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        server: 'localhost',
        port: '3306',
        databaseName: '',
        username: 'root',
        password: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/login');
        if (user && !ALLOWED_ROLES.includes(user.role)) router.push('/dashboard');
    }, [isAuthenticated, authLoading, user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        setServerError('');
        setSuccessMessage('');
    };

    const validateFormData = (): boolean => {
        const newErrors = validateForm(formData, {
            name: validateInstanceName,
            server: validateServer,
            port: (val: string | number) => validatePort(parseInt(val.toString())),
            databaseName: validateDatabaseName,
            username: validateUsername,
            password: validatePassword,
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateFormData()) return;
        setIsLoading(true);

        try {
            await apiService.createInstance({ ...formData, port: parseInt(formData.port) });
            setSuccessMessage('¡Instancia creada exitosamente!');
            setTimeout(() => router.push('/instances'), 2000);
        } catch (error) {
            setServerError(error instanceof Error ? error.message : 'Error al crear instancia');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                    <p className="text-gray-400 mt-4 animate-pulse">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!user || !ALLOWED_ROLES.includes(user.role)) return null;

    return (
        <div className="min-h-screen bg-black">
            <nav className="bg-gray-900 border-b border-gray-800 backdrop-blur-lg bg-opacity-90 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        MultiDB Academy
                    </Link>
                    <Link href="/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all">
                        Volver
                    </Link>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="mb-8 animate-fade-in-down">
                    <h1 className="text-4xl font-bold text-white mb-2">Crear Nueva Instancia</h1>
                    <p className="text-gray-400">Configura una nueva instancia de base de datos</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 animate-fade-in-up">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 group">
                            <label className="block text-sm font-medium text-gray-300 transition-colors group-focus-within:text-white">
                                Nombre de la Instancia *
                            </label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 hover:border-gray-600"
                                placeholder="Ej: MySQL Producción"
                            />
                            {errors.name && <p className="text-red-400 text-sm mt-1 animate-shake">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="block text-sm font-medium text-gray-300 transition-colors group-focus-within:text-white">
                                    Servidor *
                                </label>
                                <input
                                    name="server"
                                    value={formData.server}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 hover:border-gray-600"
                                    placeholder="localhost"
                                />
                                {errors.server && <p className="text-red-400 text-sm mt-1 animate-shake">{errors.server}</p>}
                            </div>

                            <div className="space-y-2 group">
                                <label className="block text-sm font-medium text-gray-300 transition-colors group-focus-within:text-white">
                                    Puerto *
                                </label>
                                <input
                                    name="port"
                                    type="number"
                                    value={formData.port}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 hover:border-gray-600"
                                    placeholder="3306"
                                />
                                {errors.port && <p className="text-red-400 text-sm mt-1 animate-shake">{errors.port}</p>}
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="block text-sm font-medium text-gray-300 transition-colors group-focus-within:text-white">
                                Nombre de Base de Datos *
                            </label>
                            <input
                                name="databaseName"
                                value={formData.databaseName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 hover:border-gray-600"
                                placeholder="Ej: mi_base_datos"
                            />
                            {errors.databaseName && <p className="text-red-400 text-sm mt-1 animate-shake">{errors.databaseName}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="block text-sm font-medium text-gray-300 transition-colors group-focus-within:text-white">
                                    Usuario *
                                </label>
                                <input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 hover:border-gray-600"
                                    placeholder="root"
                                />
                                {errors.username && <p className="text-red-400 text-sm mt-1 animate-shake">{errors.username}</p>}
                            </div>

                            <div className="space-y-2 group">
                                <label className="block text-sm font-medium text-gray-300 transition-colors group-focus-within:text-white">
                                    Contraseña *
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 hover:border-gray-600"
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="text-red-400 text-sm mt-1 animate-shake">{errors.password}</p>}
                            </div>
                        </div>

                        {successMessage && (
                            <div className="bg-green-900 bg-opacity-50 border border-green-500 text-green-300 px-4 py-3 rounded-lg animate-fade-in flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {successMessage}
                            </div>
                        )}

                        {serverError && (
                            <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-300 px-4 py-3 rounded-lg animate-fade-in flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {serverError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creando instancia...
                                </span>
                            ) : (
                                'Crear Instancia'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}