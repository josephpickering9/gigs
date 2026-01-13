<template>
    <!-- Hero Section Skeleton -->
    <div class="relative w-full h-[60vh] min-h-[400px] bg-base-300 shimmer overflow-hidden">
       <div class="absolute inset-0 flex items-center justify-center flex-col gap-6 z-10 px-4">
           <!-- Title -->
           <div class="h-12 md:h-16 w-3/4 max-w-2xl bg-base-content/5 rounded-xl"></div>
           <!-- Support Acts -->
           <div class="flex flex-wrap justify-center gap-3">
               <div class="h-8 w-24 bg-base-content/5 rounded-full"></div>
               <div class="h-8 w-32 bg-base-content/5 rounded-full"></div>
           </div>
       </div>
       <!-- Gradient overlay to match real page -->
       <div class="absolute inset-0 bg-gradient-to-t from-base-200 via-transparent to-transparent opacity-50"></div>
    </div>

    <!-- Content Container -->
    <div class="w-full max-w-6xl mx-auto px-0 md:px-4 -mt-20 relative z-20 pb-20">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Main Content (Setlist) -->
            <div class="lg:col-span-2 space-y-8 order-2 lg:order-1">
                 <!-- Setlist Card Skeleton -->
                 <div class="card bg-base-100 h-[600px] shimmer rounded-none sm:rounded-2xl border-x-0 sm:border border-base-content/5">
                     <div class="card-body">
                         <div class="h-8 w-1/3 bg-base-content/5 mb-8 rounded-lg"></div>
                         
                         <!-- List items -->
                         <div class="space-y-6">
                            <div v-for="i in 8" :key="i" class="flex items-center gap-4">
                                <div class="w-8 h-8 rounded-full bg-base-content/5 shrink-0"></div>
                                <div class="h-6 flex-1 bg-base-content/5 rounded-lg"></div>
                                <div class="w-12 h-6 bg-base-content/5 rounded-lg shrink-0"></div>
                            </div>
                         </div>
                     </div>
                 </div>
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-1 space-y-6 order-1 lg:order-2">
                 <!-- Info Card -->
                 <div class="card bg-base-100 h-auto shimmer rounded-none sm:rounded-2xl border-y border-base-content/5 sm:border">
                    <div class="card-body p-4 sm:p-6 space-y-4">
                         <!-- Date -->
                         <div class="flex items-center gap-4">
                             <div class="w-10 h-10 rounded-full bg-base-content/5 shrink-0"></div>
                             <div class="flex-1 space-y-2">
                                 <div class="h-4 w-3/4 bg-base-content/5 rounded"></div>
                             </div>
                         </div>
                         <!-- Venue -->
                         <div class="flex items-center gap-4">
                             <div class="w-10 h-10 rounded-full bg-base-content/5 shrink-0"></div>
                             <div class="flex-1 space-y-2">
                                 <div class="h-4 w-1/2 bg-base-content/5 rounded"></div>
                                 <div class="h-3 w-1/3 bg-base-content/5 rounded"></div>
                             </div>
                         </div>
                         <!-- Price -->
                         <div class="flex items-center gap-4">
                             <div class="w-10 h-10 rounded-full bg-base-content/5 shrink-0"></div>
                             <div class="flex-1 space-y-2">
                                 <div class="h-4 w-1/3 bg-base-content/5 rounded"></div>
                             </div>
                         </div>
                         <div class="pt-4 border-t border-base-content/5">
                             <div class="h-3 w-20 bg-base-content/5 mb-3 rounded"></div>
                             <div class="flex gap-2">
                                 <div class="w-20 h-6 rounded-full bg-base-content/5"></div>
                                 <div class="w-24 h-6 rounded-full bg-base-content/5"></div>
                             </div>
                         </div>
                    </div>
                 </div>
                 
                 <!-- Map Card -->
                  <div class="card bg-base-100 shimmer h-[350px] rounded-none sm:rounded-2xl border-y border-base-content/5 sm:border"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.shimmer {
  position: relative;
  overflow: hidden;
}

.shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
