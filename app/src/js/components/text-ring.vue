<template>
   <div class="ring text-ring" @click.stop="$emit('click', $event.target.value)">
      <svg :width="radius * 2" :height="radius * 2">
         <circle
            :r="normalised_radius"
            :cx="radius"
            :cy="radius"
            :stroke-width="stroke"
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
      stroke: Number
   },
   computed: {
      normalised_radius () {
         return this.radius - this.stroke / 2
      }
   }
}
</script>
