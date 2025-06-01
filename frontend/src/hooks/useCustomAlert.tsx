import { useState, type JSX } from 'react';
import CustomAlert from '../components/CustomAlert';

export function useCustomAlert(): [(msg: string) => Promise<void>, JSX.Element | null] {
  const [alert, setAlert] = useState<{ message: string; resolve: () => void } | null>(null);

  const showAlert = (message: string) => {
    return new Promise<void>((resolve) => {
      setAlert({ message, resolve });
    });
  };

  const handleClose = () => {
    if (alert) {
      alert.resolve();
      setAlert(null);
    }
  };

  const alertElement =
    alert && (
      <CustomAlert message={alert.message} onClose={handleClose} />
    );

  return [showAlert, alertElement];
}
