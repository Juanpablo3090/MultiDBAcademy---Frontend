'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../service/api';
import type { User, DatabaseInstance, UserRole, FormErrors } from '../../types';

const ALLOWED_ROLES: UserRole[] = ['Admin'];

export default function AssignInstancePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<User[]>([]);
  const [instances, setInstances] = useState<DatabaseInstance[]>([]);
  const [formData, setFormData] = useState({ studentId: '', instanceId: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && !ALLOWED_ROLES.includes(user.role)) {
      router.push('/dashboard');
      return;
    }
    if (user) {
      loadData();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [studentsData, instancesData] = await Promise.all([
        apiService.getStudents(),
        apiService.getInstances(),
      ]);
      setStudents(studentsData);
      setInstances(instancesData);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Error al cargar datos');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
    setSuccessMessage('');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.studentId) newErrors.studentId = 'Debes seleccionar un estudiante';
    if (!formData.instanceId) newErrors.instanceId = 'Debes seleccionar una instancia';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await apiService.assignInstance(formData);
      setSuccessMessage('Instancia asignada exitosamente');
      setFormData({ studentId: '', instanceId: '' });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Error al asignar instancia');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoadingData) {
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user.name}</span>
            <Link href="/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all">
              Volver
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-4xl font-bold text-white mb-2">Asignar Instancia</h1>
          <p className="text-gray-400">Asigna instancias de base de datos a estudiantes</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-300 transition-colors group-focus-within:text-white">
                Estudiante *
              </label>
              <select
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-black border ${errors.studentId ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 hover:border-gray-600`}
              >
                <option value="">-- Selecciona un estudiante --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
              {errors.studentId && <p className="text-red-400 text-sm mt-1 animate-shake">{errors.studentId}</p>}
            </div>

            <div className="space-y-2 group">
              <label htmlFor="instanceId" className="block text-sm font-medium text-gray-300 transition-colors group-focus-within:text-white">
                Instancia *
              </label>
              <select
                id="instanceId"
                name="instanceId"
                value={formData.instanceId}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-black border ${errors.instanceId ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 hover:border-gray-600`}
              >
                <option value="">-- Selecciona una instancia --</option>
                {instances.map((instance) => (
                  <option key={instance.id} value={instance.id}>
                    {instance.name}
                  </option>
                ))}
              </select>
              {errors.instanceId && <p className="text-red-400 text-sm mt-1 animate-shake">{errors.instanceId}</p>}
            </div>

            {successMessage && (
              <div className="bg-green-900 bg-opacity-50 border border-green-500 text-green-300 px-4 py-3 rounded-lg animate-fade-in">
                {successMessage}
              </div>
            )}

            {serverError && (
              <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-300 px-4 py-3 rounded-lg animate-fade-in">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:from-yellow-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Asignando...
                </span>
              ) : (
                'Asignar Instancia'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
