exports.cleanStore = (store) => {
  if (!store) return undefined

  store.ownerId = undefined
  store.staffIds = undefined
  store.e_wallet = undefined
  store.total_revenue = undefined
  return store
}
