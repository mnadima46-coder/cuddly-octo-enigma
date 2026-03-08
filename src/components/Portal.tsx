import { createPortal } from 'react-dom';
import { ReactNode } from 'react';

interface PortalProps {
  children: ReactNode;
}

export function Portal({ children }: PortalProps) {
  return createPortal(children, document.body);
}
