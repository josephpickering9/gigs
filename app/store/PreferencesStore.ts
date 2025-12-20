import { defineStore } from 'pinia'
import { ViewMode } from '~/types/ViewMode'

export const usePreferencesStore = defineStore('preferences', {
    state: () => ({
        projectsViewMode: ViewMode.CARD as ViewMode,
        gigsViewMode: ViewMode.CARD as ViewMode,
    }),
    actions: {
        setProjectsViewMode(mode: ViewMode) {
            this.projectsViewMode = mode
        },
        setGigsViewMode(mode: ViewMode) {
            this.gigsViewMode = mode
        },
    },
    persist: true,
})
