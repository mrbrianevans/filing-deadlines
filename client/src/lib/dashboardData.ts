import type {DashboardData} from '../../../fs-shared/DashboardData.js'
import {swr} from "@svelte-drama/swr";
import {readableSwrOptions} from "./swr.js";

function createDashboardData(){
  const key = '/api/user/dashboard-data'
  const { data: {subscribe}, error, refresh, update, processing } = swr<DashboardData|null>(key, readableSwrOptions)

  return {subscribe, processing, refresh, error}
}

export const dashboardData = createDashboardData()
