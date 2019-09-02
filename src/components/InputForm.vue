
<template>
  <div class="input-area">
    <div class="input">
        <at-ta v-if="activeRoom" :members="members">
            <textarea
                v-model="new_message"
                class="input-message"
                placeholder="Type a message"
                rows="1"
                @keyup.exact.enter="sendMessage"
            />
        </at-ta>
        <div v-else style="text-align:center">
            Click on a room to start chatting...
        </div>
    </div>
  </div>
</template>

<script>
import AtTa from "vue-at/dist/vue-at-textarea"
import axios from "axios";

export default {
  name: "InputFrom",
  components: {
    AtTa
  },
  props: ["activeRoom"],
  data() {
    return {
        new_message: "",
        members: [],
    };
  },
  created() {
    axios.get(`${process.env.VUE_APP_SERVER}/users`).then(data => {
        this.members = data.data.users.map(user => user.id)
    });
  },
  methods: {
    sendMessage() {
        if (!this.new_message) return;
        this.$emit("newMessage", this.new_message);
        this.new_message = "";
    },
  }
};
</script>