'use client'

import React from 'react'
import TenantInfoRequirement from '@/src/components/ui/TenantInfoRequirement'
import RestaurantEmptyState from '@/src/components/ui/RestaurantEmptyState'
import RestaurantList from '@/src/components/ui/RestaurantList'
import type { TenantInfo } from '@/src/components/ui/TenantInfoRequirement'
import type { Restaurant } from '@/src/components/ui/RestaurantList'

export default function RestaurantPage() {
  const [showInfoModal, setShowInfoModal] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([])

  // TODO: Replace with actual API call to fetch restaurants
  React.useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // Mock data - replace with API call
        // const response = await fetch('/api/tenant/restaurants')
        // const data = await response.json()
        // setRestaurants(data)

        // Uncomment this to test with mock data
        // setRestaurants([
        //   { id: '1', name: 'Nhà hàng tính thương' },
        //   { id: '2', name: 'Nhà hàng tính thương 2' },
        //   { id: '3', name: 'Nhà hàng tính thương 3' },
        //   { id: '4', name: 'Nhà hàng tính thương 4' },
        //   { id: '5', name: 'Nhà hàng tính thương 5' },
        // ])
      } catch (error) {
        console.error('Error fetching restaurants:', error)
      }
    }

    fetchRestaurants()
  }, [])

  const handleCreateClick = () => {
    setShowInfoModal(true)
  }

  const handleSubmit = async (info: TenantInfo) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call to create restaurant
      // const response = await fetch('/api/tenant/restaurants', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(info),
      // })
      // if (response.ok) {
      //   const newRestaurant = await response.json()
      //   setRestaurants((prev) => [...prev, newRestaurant])
      //   setShowInfoModal(false)
      // }

      // Mock success - add to restaurants list
      console.log('Restaurant info submitted:', info)
      const newRestaurant: Restaurant = {
        id: Date.now().toString(),
        name: info.tenantName,
        status: 'active',
      }
      setRestaurants((prev) => [...prev, newRestaurant])
      setShowInfoModal(false)
    } catch (error) {
      console.error('Error creating restaurant:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {restaurants.length === 0 ? (
        <RestaurantEmptyState onCreateClick={handleCreateClick} />
      ) : (
        <RestaurantList restaurants={restaurants} onCreateClick={handleCreateClick} />
      )}

      <TenantInfoRequirement
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
