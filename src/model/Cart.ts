export interface CartItem {
  productId: string
  quantity: number
  price: number
  name: string
  image: string
}

export interface Cart {
  id: string
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
  total: number
}
