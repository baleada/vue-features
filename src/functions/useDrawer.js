export default function useDrawer ({ initialStatus }, options = {}) {
  // TARGETS
  const root = useTarget('single'),
        drawer = useTarget('single')

  
  // STATUS
  const status = ref(initialStatus)


  // OFFSET


  // FRAME


  return {
    root: root.handle,
    drawer: drawer.handle,
    status,
    offset,
    frame,
  }
}
