import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../stores/auth';
import { PhoneVerificationModal } from './PhoneVerificationModal';

interface PhoneVerificationContextType {
  isVerificationRequired: boolean;
  checkVerificationStatus: () => void;
}

const PhoneVerificationContext = createContext<PhoneVerificationContextType>({
  isVerificationRequired: false,
  checkVerificationStatus: () => {},
});

export const usePhoneVerification = () => useContext(PhoneVerificationContext);

interface PhoneVerificationProviderProps {
  children: ReactNode;
}

export function PhoneVerificationProvider({ children }: PhoneVerificationProviderProps) {
  const [isVerificationRequired, setIsVerificationRequired] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { account, isAuthenticated } = useAuthStore();

  const checkVerificationStatus = () => {
    if (!isAuthenticated || !account) {
      setIsVerificationRequired(false);
      setShowModal(false);
      return;
    }

    // Verifica se o telefone está ausente ou não verificado
    const phoneRequired = !account.phone || !account.phone_verified;

    setIsVerificationRequired(phoneRequired);
    setShowModal(phoneRequired);
  };

  // Verificar status quando o usuário faz login ou quando o account muda
  useEffect(() => {
    checkVerificationStatus();
  }, [account, isAuthenticated]);

  const handleVerificationSuccess = (updatedUser: any) => {
    // Atualizar o estado no AuthStore usando o método updateUserData
    const { updateUserData } = useAuthStore.getState();
    updateUserData({
      phone: updatedUser.phone,
      phone_verified: updatedUser.phone_verified,
    });

    // Fechar modal e marcar como não mais necessário
    setShowModal(false);
    setIsVerificationRequired(false);
  };

  return (
    <PhoneVerificationContext.Provider
      value={{
        isVerificationRequired,
        checkVerificationStatus,
      }}
    >
      {children}

      {/* Modal de verificação obrigatório */}
      <PhoneVerificationModal
        isOpen={showModal}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </PhoneVerificationContext.Provider>
  );
}