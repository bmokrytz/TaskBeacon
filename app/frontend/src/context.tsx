import { createContext } from 'react';
import type { User } from './lib/types/index';

type TitleContextType = {
    setTitle: React.Dispatch<React.SetStateAction<string>>;
}

export const TitleContext = createContext<TitleContextType>({setTitle: () => {}});

type UserContextType = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const UserContext = createContext<UserContextType>({user: null, setUser: () => {}});

export type ErrorTextContextType = {
    errorText: string;
    setErrorText: React.Dispatch<React.SetStateAction<string>>;
    showErrorText: boolean;
    setShowErrorText: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ErrorTextContext = createContext<ErrorTextContextType>({errorText: "", setErrorText: () => {}, showErrorText: false, setShowErrorText: () => {}});
