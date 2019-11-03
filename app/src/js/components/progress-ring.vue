<template>
   <div class="progress-ring">
      <svg :width="radius * 2" :height="radius * 2">
         <circle
            stroke="#f5f5f5"
            fill="transparent"
            :stroke-width="stroke"
            :r="normalisedRadius"
            :cx="radius"
            :cy="radius"
         />
         <circle
            stroke="#c5c5c5"
            fill="transparent"
            :stroke-dasharray="circumference + ' ' + circumference"
            :style="{strokeDashoffset: strokeOffset}"
            :stroke-width="stroke"
            :r="normalisedRadius"
            :cx="radius"
            :cy="radius"
         />
      </svg>
      <p>{{Math.round(progress)}}%</p>
   </div>
</template>


<script>
export default {
   props: {
      radius: Number,
      progress: Number,
      stroke: Number
   },
   computed: {
      shortProgress () {
         return Math.floor(this.progress * 100) / 100
      },
      normalisedRadius () {
         return this.radius - this.stroke * 2
      },
      circumference () {
         return this.normalisedRadius * 2 * Math.PI
      },
      strokeOffset () {
         return this.circumference - this.progress / 100 * this.circumference
      }
   }
}
</script>