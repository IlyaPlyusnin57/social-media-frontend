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
        notifications: {
          messages: [],
          follows: [],
          variousNotifications: [],
        },
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

      const newNotifications = state.notifications;
      newNotifications.messages = [...state.notifications.messages, message];

      return {
        ...state,
        notifications: newNotifications,
      };
    }
    case "SET_FOLLOW_NOTIFICATION": {
      const follow = action.payload;
      const newNotifications = state.notifications;
      newNotifications.follows = [...state.notifications.follows, follow];

      return {
        ...state,
        notifications: newNotifications,
      };
    }
    case "SET_VARIOUS_NOTIFICATION": {
      const various = action.payload;
      const newNotifications = state.notifications;
      newNotifications.variousNotifications = [
        ...state.notifications.variousNotifications,
        various,
      ];

      return { ...state, notifications: newNotifications };
    }

    case "CLEAR_MESSAGE_NOTIFICATION": {
      const messageId = action.payload;

      const newMessageNotifications = state.notifications.messages.filter(
        (notification) => {
          return notification._id !== messageId;
        }
      );

      const newNotifications = state.notifications;
      newNotifications.messages = newMessageNotifications;

      return {
        ...state,
        notifications: newNotifications,
      };
    }
    case "CLEAR_FOLLOW_NOTIFICATION": {
      const followId = action.payload;

      const newFollowNotifications = state.notifications.follows.filter(
        (follow) => {
          return follow.id !== followId;
        }
      );

      const newNotifications = state.notifications;
      newNotifications.follows = newFollowNotifications;

      return {
        ...state,
        notifications: newNotifications,
      };
    }
    case "CLEAR_VARIOUS_NOTIFICATION": {
      const variousId = action.payload;

      const newVariousNotifications =
        state.notifications.variousNotifications.filter((various) => {
          return various.id !== variousId;
        });

      const newNotifications = state.notifications;
      newNotifications.variousNotifications = newVariousNotifications;

      return { ...state, notifications: newNotifications };
    }
    case "CLEAR_MESSAGE_NOTIFICATION_FOR_CONVERSATION": {
      const conversationId = action.payload;

      const newMessageNotifications = state.notifications.messages.filter(
        (message) => {
          return message.conversationId !== conversationId;
        }
      );

      const newNotifications = state.notifications;
      newNotifications.messages = newMessageNotifications;

      return {
        ...state,
        notifications: newNotifications,
      };
    }
    case "SET_VIEWING_CONVERSATION": {
      return {
        ...state,
        viewingConversation: action.payload,
      };
    }
    case "SET_NOTIFICATIONS": {
      const newNotifications = action.payload;

      // check if there are any messages in the storage
      const storageMessages = JSON.parse(sessionStorage.getItem("messages"));

      if (storageMessages) {
        newNotifications.messages.push(...storageMessages);
      }

      return {
        ...state,
        notifications: newNotifications,
      };
    }
    case "SET_FOLLOW": {
      const followId = action.payload;

      const newFollowingArr = [...state.user.following, followId];

      return { ...state, user: { ...state.user, following: newFollowingArr } };
    }
    case "REMOVE_FOLLOW": {
      const followId = action.payload;

      const newFollowingArr = state.user.following.filter(
        (userId) => userId !== followId
      );

      return { ...state, user: { ...state.user, following: newFollowingArr } };
    }
    case "ADD_BLOCKED_USER": {
      return {
        ...state,
        user: {
          ...state.user,
          blocked: [...state.user.blocked, action.payload],
        },
      };
    }
    case "REMOVE_BLOCKED_USER": {
      const newblockedArray = state.user.blocked.filter(
        (userId) => userId !== action.payload
      );

      return {
        ...state,
        user: {
          ...state.user,
          blocked: newblockedArray,
        },
      };
    }
    case "SET_BLOCK_OBJECT": {
      return {
        ...state,
        blocks: action.payload,
      };
    }
    case "ADD_TO_BLOCK_OBJECT": {
      const newArray = [state.blocks, action.payload];

      return {
        ...state,
        blocks: newArray,
      };
    }
    case "REMOVE_FROM_BLOCK_OBJECT": {
      const newArray = state.blocks.filter(
        (userId) => userId !== action.payload
      );

      return {
        ...state,
        blocks: newArray,
      };
    }
    default:
      return state;
  }
}
