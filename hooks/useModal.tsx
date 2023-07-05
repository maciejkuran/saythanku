import { useState } from 'react';
import { useRouter } from 'next/router';

interface Modal {
  showHandler(): void;
  hideHandler(): void;
  showModal: boolean;
}

const useModal = (toUrl?: string, backToUrl?: string): Modal => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const router = useRouter();

  const showHandler = () => {
    setShowModal(true);
    if (toUrl) router.push(toUrl);
  };

  const hideHandler = () => {
    setShowModal(false);
    if (backToUrl) router.push(backToUrl);
  };

  return { showModal, showHandler, hideHandler };
};

export default useModal;
