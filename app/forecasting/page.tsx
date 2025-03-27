import { Suspense } from "react"
import { ForecastingDashboard } from "@/components/forecasting-dashboard"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function ForecastingPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Construction Cost Forecasting</h1>
        <p className="text-muted-foreground mt-1">Predict future material and labor costs using historical data</p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <ForecastingDashboard />
      </Suspense>
    </div>
  )
}

