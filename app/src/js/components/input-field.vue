<template>
   <div class="input">
      <input
         :type="hidden ? 'password' : 'text'"
         :value="value"
         :placeholder="placeholder"
         :disabled="disabled"
         :autocomplete="autocomplete ? 'on' : 'new-password'"
         @input="$emit('input', $event.target.value)"
         @keydown.escape="$emit('input', '')"
         @keydown.enter="$emit('enter', value)"
         spellcheck="false"
         ref="el">
      <span class="input-bg" @mousedown.prevent="$refs.el.focus()"></span>
   </div>
</template>


<script>
export default {
   props: {
      value: String,
      placeholder: String,
      hidden: Boolean,
      disabled: Boolean,
      autocomplete: Boolean
   }
}
</script>
