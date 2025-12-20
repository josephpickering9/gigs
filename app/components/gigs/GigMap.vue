<template>
  <div class="card bg-base-100 shadow-xl overflow-hidden h-full">
    <div class="h-full min-h-[300px] w-full relative">
       <div v-if="!searchQuery" class="flex items-center justify-center h-full bg-base-200 text-gray-500">
          <p>No location data available</p>
       </div>
       <iframe
        v-else
        width="100%"
        height="100%"
        style="border:0"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        :src="mapUrl">
      </iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  venueName?: string;
  city?: string;
}>();

const searchQuery = computed(() => {
  const parts = [];
  if (props.venueName) parts.push(props.venueName);
  if (props.city) parts.push(props.city);
  return parts.join(', ');
});

// Using the Google Maps Embed API in search mode.
// Note: Technically requires an API key, but often works in basic mode or might show a "For Development Purposes Only" watermark if no key is valid.
// We are using the 'search' mode.
const config = useRuntimeConfig();
const apiKey = config.public['googleMapsApiKey'] || ''; // Assumes we might add this later

const mapUrl = computed(() => {
    // If we have a key, use the proper embed API
    // https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=record+stores+in+Seattle
    if (apiKey) {
      return `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(searchQuery.value)}`;
    }
    
    // Fallback/Workaround for no key (often works for simple embedding, or we might need to change to a simple link if this fails)
    // using the 'maps?q=' format output=embed is the old way, but often still functional or at least directs correctly.
    // A more reliable modern keyless way is technically not supported for 'search' mode in standard iframes without potential watermarks.
    // Let's try the output=embed approach which is common for "unofficial" embeds.
    return `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery.value)}&output=embed`;
});
</script>
