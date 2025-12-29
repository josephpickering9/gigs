import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable to detect if the current device is mobile based on window width
 * @param breakpoint - The width in pixels to consider as mobile (default: 768px)
 * @returns Reactive boolean indicating if device is mobile
 */
export function useDevice(breakpoint = 768) {
    const isMobile = ref(false)

    const checkMobile = () => {
        if (import.meta.client) {
            isMobile.value = window.innerWidth < breakpoint
        }
    }

    onMounted(() => {
        checkMobile()
        window.addEventListener('resize', checkMobile)
    })

    onUnmounted(() => {
        if (import.meta.client) {
            window.removeEventListener('resize', checkMobile)
        }
    })

    return { isMobile }
}
