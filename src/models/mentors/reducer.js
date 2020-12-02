import * as types from './types.js';
import { updateMentor, deleteMentor } from './helper-functions.js';

const initialState = {
  mentors: null,
  isLoading: false,
  isLoaded: false,
  error: '',
};

export const mentorsModelReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.LOADING_SUCCESS:
      return {
        ...state,
        isLoading: true,
        isLoaded: false,
        error: '',
      };
    case types.LOADING_FAILED:
      return {
        ...state,
        isLoading: false,
        isLoaded: false,
        error: action.payload.error.message,
      };
    case types.FETCHING_MENTORS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        error: action.payload.data,
      };
    case types.ADDING_MENTOR_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        mentors: state.mentors ? [...state.mentors, action.payload.data] : null,
      };
    case types.EDITING_MENTOR_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        mentors: updateMentor(state.mentor, action.payload.data),
      };
    case types.DELETING_MENTOR_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        mentors: deleteMentor(state.mentors, action.payload.id),
      };
    default:
      return state;
  }
};
