import { configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers } from 'redux'
import authReducer from './auth/authSlice'
import profileReducer from './profile/profileSlice'
import onboardingReducer from './onboarding/onboardingSlice'
import sobrietyReducer from './sobriety/sobrietySlice'
import matchesReducer from './matches/matchesSlice'
import connectionsReducer from './connections/connectionsSlice'
import messagesReducer from './messages/messagesSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  onboarding: onboardingReducer,
  sobriety: sobrietyReducer,
  matches: matchesReducer,
  connections: connectionsReducer,
  messages: messagesReducer,
})

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'profile', 'onboarding'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
