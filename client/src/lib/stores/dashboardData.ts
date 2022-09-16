import type {DashboardData} from '../../../../fs-shared/DashboardData.js'
import {swr} from "@svelte-drama/swr";
import {readableSwrOptions} from "../swr.js";
import { refreshInterval } from '@svelte-drama/swr/plugin';

function createDashboardData(){
  const key = '/api/user/org/member/dashboard-data'
  const { data: {subscribe}, error, refresh, update, processing } = swr<DashboardData|null>(key, {...readableSwrOptions, plugins: [refreshInterval({ interval: 120*1000 })]})

  return {subscribe, processing, refresh, error}
}

export const dashboardData = createDashboardData()
