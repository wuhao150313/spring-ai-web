import { ref, computed } from "vue";
import { isLoggedIn, getUserInfo } from "../utils/auth";

/**
 * 认证状态管理 Store
 */
export function useAuthStore() {
  const loggedIn = ref(isLoggedIn());
  const userInfo = ref(getUserInfo());

  const setLoggedIn = (status: boolean) => {
    loggedIn.value = status;
  };

  const setUserInfo = (info: any) => {
    userInfo.value = info;
  };

  return {
    isLoggedIn: computed(() => loggedIn.value),
    userInfo: computed(() => userInfo.value),
    setLoggedIn,
    setUserInfo,
  };
}

