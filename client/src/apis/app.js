import axios from '../axios'
export const apiGetCategories = () =>
  axios({
    url: '/product-category',
    method: 'get'
  })
