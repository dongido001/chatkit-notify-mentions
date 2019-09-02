
<template>
    <div ref="messages" class="messages">
        <div v-for="message in messages" :key="message.id">
            <div :class="['message-container message', messageDirection(message, 'float-') ]">
                <div class="chat-name"> {{ message.sender.name }} </div>
                <template v-for="(part, id) in message.parts">
                    <span :key="id" v-html="enhancedMention(part.payload.content)"/>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: "Messages",
  props: ["messages", "currentUser"],
  methods: {
    messageDirection(message, css = "") {
      return message.senderId !== this.currentUser.id
        ? `${css}left`
        : `${css}right`;
    },
    enhancedMention(message) {
      return message.replace(/\B@\S*/g, `<span class="mention">$&</span>`)
    },
  }
};
</script>

<style>
.mention {
    color: rgb(31, 177, 97);
    font-weight: bolder;
}
</style>