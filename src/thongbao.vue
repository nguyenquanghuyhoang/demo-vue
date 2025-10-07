
<script setup>
/**
 * String
 * Number
 * Bolean
 * Array
 * Object
 */
defineProps({
    message: {
        type: String,
        // default: "không có thông báo",
        required: true
    }
})

</script>

<template>
    <div class="message">
         <span>{{message}}</span>
    </div>
</template>

<style scoped>
.message {
    background: green;
    border: 1px solid black;
    text-align: center;
}
.message span {
  color: white;

}
</style>
