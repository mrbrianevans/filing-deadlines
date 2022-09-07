import {writable} from "svelte/store";
import sampleClientList from '../assets/sampleClientList.json'
import type {ClientListItem} from "../../../fs-shared/ClientList.js";
import type { ParseLocalConfig, ParseResult} from 'papaparse'
import camelcase from "camelcase";
function createClientList(){
  const {set,update, subscribe} = writable<ClientListItem[]>([...sampleClientList])

  /** Add either one or many clients to the list */
  function addNew(client: ClientListItem|ClientListItem[]){
    update(prev=>prev.concat(client))
  }


  function remove(companyNumber: ClientListItem['company_number']){
    update(prev=>prev.filter(c=>c.company_number!==companyNumber))
  }


  return {subscribe, addNew, remove}
}

export const clientList = createClientList()


export async function importClientListCsv(csv){
  console.log("Import CSV", csv.name, csv.type)
  const papa = await import('papaparse')
  const papaOptions: Partial<ParseLocalConfig<unknown, any>> = {
    worker: false, delimiter: ',', skipEmptyLines:true, header: true, transformHeader(header: string): string {
      return camelcase(header.trim())
    }
  }
  const rows:ParseResult<{ companyNumber: string }> = await new Promise((resolve, reject) => papa.parse(csv, {complete: resolve, error: reject,...papaOptions }))
  const companyNumbers = rows.data.map(r=>r.companyNumber)
  console.log(companyNumbers.slice(0,4))
}
