import { createContext } from 'react';

type EnableDeleteContextType = {
    enableDelete: boolean;
}

export const EnableDeleteContext = createContext<EnableDeleteContextType>({enableDelete: false});
