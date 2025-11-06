import { useState, useEffect } from 'react';
import { verifyName, verifyNickname, verifyEmail, verifyPassword, verifyConfirmPassword } from '@/libs/validation/userDataValidation';
import { registerUser } from '@/libs/auth/handleRegister';
import { useRouter } from 'expo-router';

export const useRegisterForm = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userName: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    backendEmail: '',
    backendNickname: ''
  });

  useEffect(() => {
    if (formData.name) setErrors(prev => ({ ...prev, name: verifyName(formData.name) }));
    if (formData.email) setErrors(prev => ({ ...prev, email: verifyEmail(formData.email) }));
    if (formData.password) setErrors(prev => ({ ...prev, password: verifyPassword(formData.password) }));
    if (formData.confirmPassword) setErrors(prev => ({ 
      ...prev, 
      confirmPassword: verifyConfirmPassword(formData.password, formData.confirmPassword) 
    }));
    if (formData.userName) setErrors(prev => ({ ...prev, nickname: verifyNickname(formData.userName) }));
  }, [formData]);

  useEffect(() => {
    if (formData.email) setErrors(prev => ({ ...prev, backendEmail: '' }));
  }, [formData.email]);

  useEffect(() => {
    if (formData.userName) setErrors(prev => ({ ...prev, backendNickname: '' }));
  }, [formData.userName]);

  const isDisabled = !(
    formData.email && 
    !verifyPassword(formData.password) && 
    formData.name && 
    formData.userName && 
    !verifyConfirmPassword(formData.password, formData.confirmPassword)
  );

  const handleSubmit = async () => {
    const validationErrors = {
      name: verifyName(formData.name),
      email: verifyEmail(formData.email),
      password: verifyPassword(formData.password),
      confirmPassword: verifyConfirmPassword(formData.password, formData.confirmPassword),
      nickname: verifyNickname(formData.userName)
    };

    setErrors(prev => ({ ...prev, ...validationErrors }));

    if (Object.values(validationErrors).every(error => !error)) {
      try {
        const data = await registerUser(formData);

        const returnedMessage = (data && (data.error || data.message)) || null;
        if (returnedMessage) {
          const statusMessage = String(returnedMessage);
          const lower = statusMessage.toLowerCase();

          if (lower.includes('email')) {
            setErrors(prev => ({ ...prev, backendEmail: statusMessage }));
          } else if (
            lower.includes('nome de usuário') ||
            lower.includes('username') ||
            lower.includes('nome de usuario') ||
            lower.includes('usuario')
          ) {
            setErrors(prev => ({ ...prev, backendNickname: statusMessage }));
          }
          return;
        }

        router.push('/(Auth)/login');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const lower = message.toLowerCase();

        if (lower.includes('email')) {
          setErrors(prev => ({ ...prev, backendEmail: message }));
        } else if (
          lower.includes('usuário') ||
          lower.includes('username') ||
          lower.includes('usuario')
        ) {
          setErrors(prev => ({ ...prev, backendNickname: message }));
        }
      }
    }
  };

  return {
    formData,
    errors,
    isDisabled,
    setFormData,
    handleSubmit
  };
};