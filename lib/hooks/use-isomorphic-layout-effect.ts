import { useEffect, useLayoutEffect } from 'react';

/**
 * A safe version of useLayoutEffect that falls back to useEffect during SSR
 * This helps avoid the React warning about useLayoutEffect during server-side rendering
 */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect; 