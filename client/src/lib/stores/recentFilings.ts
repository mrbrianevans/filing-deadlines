import {swr} from "@svelte-drama/swr";
import {readableSwrOptions} from "../swr.js";
import {refreshInterval} from "@svelte-drama/swr/plugin";
import type {ConfirmationStatementsData} from '../../../../fs-shared/ConfirmationStatements.js'

function createRecentFilings(){
  const key = '/api/user/org/member/recent-filings'
  const { data: {subscribe}, error, refresh, update, processing } = swr<ConfirmationStatementsData|null>(key, {...readableSwrOptions, plugins: [refreshInterval({ interval: 10*1000 })]})

  return {subscribe, processing, refresh, error}
}

export const recentFilings = createRecentFilings()
