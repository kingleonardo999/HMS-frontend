import { defineStore } from "pinia";
import { ref } from 'vue'

type userData = {
  loginId: string;
  name: string;
  roleName: string;
  phone: string;
  photo: string;
}

export default defineStore(
  "user", 
  () => {
    const user = ref({} as userData);
    function setUser(newUser: userData) {
      user.value = newUser;
    }
    function clearUser() {
      sessionStorage.clear(); // 清除 sessionStorage 缓存
      // sessionStorage.removeItem('user'); // 清除 user 缓存
      user.value = {} as userData;
    }
    return {
      user,
      setUser,
      clearUser,
    };
  },{
    persist: true // 持久化存储
  } 
);