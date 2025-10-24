import { X } from 'lucide-react-native';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Modal as RNModal, Pressable, View } from 'react-native';

import Icon from '@/src/components/ui/Icon';
import { cn } from '@/src/lib/utils/cn';

const DISAPPEAR_TIME_MS = 300;

type TModalProps = {
  children: ReactNode;
  isVisible: boolean;
  close: () => void;
};

const Modal = ({ children, isVisible, close }: TModalProps) => {
  const [isDisplaying, setIsDisplaying] = useState<boolean>(false);
  const isClosingRef = useRef<boolean>(false);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;

    close();
    isClosingRef.current = true;

    setTimeout(() => {
      setIsDisplaying(false);
      isClosingRef.current = false;
    }, DISAPPEAR_TIME_MS);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setIsDisplaying(isVisible);
      return;
    }

    // close modal
    handleClose();
  }, [isVisible]);

  // modal is closed
  if (!isDisplaying) return null;

  return (
    <RNModal transparent visible={isDisplaying} onRequestClose={handleClose}>
      <Pressable
        className={cn(
          'absolute inset-0 z-10 items-center justify-center bg-black/50 transition-opacity duration-300',
          !isVisible && 'opacity-0',
        )}
        onPress={(e) => {
          if (e.target !== e.currentTarget) return;
          handleClose();
        }}
      >
        <View className="max-h-[80vh] w-full gap-2 rounded-lg border border-border bg-card p-4">
          <Pressable
            className="absolute right-0 top-0 p-2"
            onPress={handleClose}
          >
            <Icon icon={X} className="size-5" />
          </Pressable>

          {children}
        </View>
      </Pressable>
    </RNModal>
  );
};

export default Modal;
