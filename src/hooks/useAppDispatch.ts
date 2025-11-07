/**
 * useAppDispatch Hook
 * Typed Redux hooks for app-specific store
 * Feature: 002-app-screens
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

/**
 * Typed dispatch hook
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed selector hook
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
