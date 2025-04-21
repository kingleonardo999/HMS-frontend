import { defineStore } from "pinia";
import { ref } from 'vue'

type userData = {
  id: string;
  name: string;
  role: string;
}

export default defineStore(
  "user", 
  () => {
    const user = ref({} as userData);
    function setUser(newUser: userData) {
      user.value = newUser;
    }
    return {
      user,
      setUser,
    };
  },{
    persist: true // 持久化存储
  } 
);