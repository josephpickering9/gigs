import draggable from 'vuedraggable/src/vuedraggable'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('Draggable', draggable)
})
