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
            :stroke-dashoffset="stroke_offset"
            :stroke-width="stroke"
            :stroke="get_color(progress)"
            :r="normalised_radius"
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
      normalised_radius () {
         return this.radius - this.stroke / 2
      },
      circumference () {
         return this.normalised_radius * 2 * Math.PI
      },
      stroke_offset () {
         return this.circumference - this.progress / 100 * this.circumference
      }
   },
   methods: {
      get_color (percent) {
         return `hsl(${(percent/100) * 120},30%,50%)`
      }
   }
}
</script>
