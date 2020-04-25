<template>
   <div class="ring text-ring" @click.stop="clickHandler()">
      <svg :width="radius * 2" :height="radius * 2">
         <circle
            :r="radius"
            :cx="radius"
            :cy="radius"
         />
      </svg>
      <p>{{text}}</p>
   </div>
</template>


<script>
export default {
   props: {
      radius: Number,
      text: String,
      clickHandler: Function
   }
}
</script>
