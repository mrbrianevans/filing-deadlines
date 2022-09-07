import {writable} from "svelte/store";
import sampleDashboardData from "../assets/sampleDashboardData.json";
import type {DashboardData} from '../../../fs-shared/DashboardData.js'

function createDashboardData(){
  const {set,update, subscribe} = writable<DashboardData>(sampleDashboardData, function(subscriber){
    //todo: listen to server for updates
    // subscriber([])
  })


  return {subscribe}
}

export const dashboardData = createDashboardData()
