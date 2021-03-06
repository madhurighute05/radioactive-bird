import {
  SEARCH_TWEETS,
  FINISHED_SEARCHING_TWEETS,
  ERROR_SEARCHING_TWEETS,
} from '../actions/tweets';

export default (
  state = { loading: false, result: [], query: '', metadata: {} },
  action
) => {
  switch (action.type) {
    case SEARCH_TWEETS:
      return {
        ...state,
        isError: false,
        error: undefined,
        metadata: {},
        loading: true,
        query: action.query,
      };

    case FINISHED_SEARCHING_TWEETS:
      return {
        ...state,
        loading: false,
        result: action.payload.statuses.map(e => e['id_str']),
        metadata: action.payload.search_metadata,
      };

    case ERROR_SEARCHING_TWEETS:
      return {
        ...state,
        loading: false,
        isError: true,
        error: action.error,
      };

    default:
      return state;
  }
};
