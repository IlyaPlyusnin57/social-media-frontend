export default function AuthReducer(state, action) {
  switch (action.type) {
    case "SET_ERROR_NULL": {
      return {
        ...state,
        error: null,
      };
    }
    case "LOGOUT": {
      return {
        user: null,
        isFetching: false,
        error: null,
        onlineFriends: new Map(),
        socket: null,
        messageNotifications: [],
        messageDropDown: [],
        viewingConversation: false,
      };
    }
    case "LOGIN_START": {
      return {
        ...state,
        user: null,
        isFetching: true,
        error: null,
      };
    }
    case "LOGIN_SUCCESS": {
      return {
        ...state,
        user: action.payload,
        isFetching: false,
        error: null,
      };
    }
    case "LOGIN_FAILURE": {
      return {
        ...state,
        user: null,
        isFetching: false,
        error: action.payload,
      };
    }
    case "REGISTER_START": {
      return {
        ...state,
        user: null,
        isFetching: true,
        error: null,
      };
    }
    case "SET_ERROR": {
      return {
        ...state,
        user: null,
        isFetching: false,
        error: action.payload,
      };
    }
    case "REGISTER_SUCCESS": {
      return {
        ...state,
        user: action.payload,
        isFetching: false,
        error: null,
      };
    }
    case "FOLLOW": {
      return {
        ...state,
        user: {
          ...state.user,
          followings: [...state.user.following, action.payload],
        },
      };
    }
    case "UNFOLLOW": {
      return {
        ...state,
        user: {
          ...state.user,
          following: state.user.following.filter(
            (item) => item !== action.payload
          ),
        },
      };
    }
    case "UPDATE_ONLINE_FRIENDS": {
      return {
        ...state,
        onlineFriends: action.payload,
      };
    }
    case "ADD_ONLINE_FRIEND": {
      const newMap = new Map(state.onlineFriends);

      if (newMap.has(action.payload)) {
        return {
          ...state,
        };
      }

      newMap.set(action.payload, "");

      return {
        ...state,
        onlineFriends: newMap,
      };
    }

    case "REMOVE_ONLINE_FRIEND": {
      const newMap = new Map(state.onlineFriends);
      newMap.delete(action.payload);
      return {
        ...state,
        onlineFriends: newMap,
      };
    }
    case "SET_SOCKET": {
      return {
        ...state,
        socket: action.payload,
      };
    }
    case "UPDATE_TOKEN": {
      return {
        ...state,
        user: {
          ...state.user,
          accessToken: action.payload,
        },
      };
    }
    case "SET_MESSAGE_NOTIFICATION": {
      if (state.viewingMessages) {
        return state;
      }

      console.log("Setting message notification");
      return {
        ...state,
        messageNotifications: [...state.messageNotifications, action.payload],
      };
    }
    case "CLEAR_MESSAGE_NOTIFICATION": {
      console.log("CLEARRRING");
      return {
        ...state,
        messageNotifications: [],
      };
    }
    case "SET_VIEWING_MESSAGES": {
      return {
        ...state,
        viewingMessages: action.payload,
      };
    }
    default:
      return state;
  }
}
