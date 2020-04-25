<template>
   <div class="ring progress-ring">
      <svg :width="radius * 2" :height="radius * 2">
         <circle
            :r="radius"
            :cx="radius"
            :cy="radius"
         />
         <circle
            :stroke-dasharray="circumference + ' ' + circumference"
            :stroke-dashoffset="strokeOffset"
            :stroke-width="stroke"
            :stroke="getColor(progress)"
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
         return this.radius - this.stroke / 2
      },
      circumference () {
         return this.normalisedRadius * 2 * Math.PI
      },
      strokeOffset () {
         return this.circumference - this.progress / 100 * this.circumference
      }
   },
   methods: {
      getColor (percent) {
         return `hsl(${(percent/100) * 120},30%,50%)`
      }
   }
}
</script>
