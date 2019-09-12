export const getParentInfo = (state) => ({
  parent_ids_mapping: state.parent_ids_mapping,
  selected_parent_ids_mapping: state.selected_parent_ids,
  parents: state.parents_mapping
})