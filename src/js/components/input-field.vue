<template>
   <div class="input">
      <label><span>{{placeholder}}</span>
         <input
            :type="hidden ? 'password' : 'text'"
            :value="modelValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :autocomplete="autocomplete ? 'on' : 'new-password'"
            @input="$emit('update:modelValue', $event.target.value)"
            @keydown.escape="$emit('input', '')"
            @keydown.enter="$emit('enter', modelValue)"
            spellcheck="false"
            ref="el">
      </label>
      <span class="input-bg" @mousedown.prevent="$refs.el.focus()"></span>
   </div>
</template>


<script>
export default {
   props: {
      modelValue: String,
      placeholder: String,
      hidden: Boolean,
      disabled: Boolean,
      autocomplete: Boolean
   },
   emits: ["update:modelValue"]
}
</script>
