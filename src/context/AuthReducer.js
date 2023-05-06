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
      const message = action.payload;

      if (
        state.viewingConversation &&
        state.viewingConversation === message.message.conversationId
      ) {
        return state;
      }

      return {
        ...state,
        messageNotifications: [...state.messageNotifications, message],
      };
    }
    case "CLEAR_MESSAGE_NOTIFICATION": {
      const messageId = action.payload;

      const newMessageNotifications = state.messageNotifications.filter(
        (obj) => {
          return obj.message._id !== messageId;
        }
      );

      return {
        ...state,
        messageNotifications: newMessageNotifications,
      };
    }
    case "CLEAR_MESSAGE_NOTIFICATION_FOR_CONVERSATION": {
      const conversationId = action.payload;

      const newMessageNotifications = state.messageNotifications.filter(
        (obj) => {
          return obj.message.conversationId !== conversationId;
        }
      );

      return {
        ...state,
        messageNotifications: newMessageNotifications,
      };
    }
    case "SET_VIEWING_CONVERSATION": {
      return {
        ...state,
        viewingConversation: action.payload,
      };
    }
    default:
      return state;
  }
}
