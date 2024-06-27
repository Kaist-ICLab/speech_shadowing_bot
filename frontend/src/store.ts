import { configureStore } from '@reduxjs/toolkit'
import audioFileReducer from './slices/audioFileSlice'

export const store = configureStore({
  reducer: {
    audioFile: audioFileReducer,
  },
// this is because throwing error: A non-serializable value was detected in the state. May not be best practice
  middleware: getDefaultMiddleware =>
  getDefaultMiddleware({
    serializableCheck: false,
  }),
})