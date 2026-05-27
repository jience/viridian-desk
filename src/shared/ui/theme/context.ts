import { createContext } from 'react';
import type { UiThemeContextValue } from './types';

export const UiThemeContext = createContext<UiThemeContextValue | null>(null);
