import type {ClientListItem} from "../../../fs-shared/ClientList.js";
import type { ParseLocalConfig, ParseResult} from 'papaparse'
import camelcase from "camelcase";
import {swr} from "@svelte-drama/swr";
import {readableSwrOptions, writableSwrOptions} from "./swr.js";
import {sortClientList} from "../../../fs-shared/ClientList.js";

function createClientList(){
  const key = '/api/user/client-list/'
  // add and delete REST endpoints
  const addClient = (id) => fetch(key, {method: 'POST', body: JSON.stringify({companyNumber: id}), headers: {'Content-Type':'application/json'}}).then((r) => r.ok)
  const deleteClient = (id) => fetch(key+id, {method: 'DELETE'}).then((r) => r.ok)

  const { data: {subscribe}, error, refresh, update,processing } = swr<ClientListItem[]|null>(key, readableSwrOptions)

  /** Add either one or many clients to the list */
  async function addNew(client: ClientListItem['company_number']|ClientListItem['company_number'][]){
    console.time('Add clients')
    const companyNumbers:string[] = [].concat(client)
    const newClients = companyNumbers.map(company_number=>({company_number, added_on: new Date().toISOString()}))
    await update(prev=>prev?.concat(newClients).sort(sortClientList)??newClients)
    //call endpoint to add by company number
    await Promise.all(companyNumbers.map(companyNumber=>addClient(companyNumber)))
    await refresh() // after adding, refresh entire list
    console.timeEnd('Add clients')
  }


  async function remove(companyNumber: ClientListItem['company_number']){
    await update(prev=>prev?.filter(c=>c.company_number!==companyNumber)) // sort order shouldn't change
    // call endpoint to remove by company number
    await deleteClient(companyNumber)
    await refresh() // after deleting, refresh entire list
  }

  return {subscribe, addNew, remove, processing}
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
  await clientList.addNew(companyNumbers)
}
