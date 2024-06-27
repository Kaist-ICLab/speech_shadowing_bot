import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  file: null,
}

export const audioFileSlice = createSlice({
  name: 'audioFile',
  initialState,
  reducers: {
    setAudioFile: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.file = action.payload
    },
    unsetAudioFile: (state) => {
        state.file = null
    },
  },
})

// Action creators are generated for each case reducer function
export const { setAudioFile, unsetAudioFile } = audioFileSlice.actions

export default audioFileSlice.reducer