import {swr} from "@svelte-drama/swr";
import {readableSwrOptions} from "../swr.js";

function createStripeStore(){
  const key = '/api/user/org/member/owner/payments/public'
  const { data: {subscribe}, error, update, processing } = swr<Record<string, string>|null>(key, readableSwrOptions)

  return {subscribe, processing, error}
}

export const stripe = createStripeStore()
