import type {ClientListItem} from "../../../../fs-shared/ClientList.js";
import type { ParseLocalConfig, ParseResult} from 'papaparse'
import {camelCase} from "change-case";
import {swr} from "@svelte-drama/swr";
import {poster, readableSwrOptions, writableSwrOptions} from "../swr.js";
import {sortClientList} from "../../../../fs-shared/ClientList.js";

function createClientList(){
  const key = '/api/user/org/member/client-list/'
  // add and delete REST endpoints
  const addClient = (companyNumber) => poster(key, {companyNumber})
  const addClients = (companyNumbers) => poster(key + 'addMany', companyNumbers)
  const deleteClient = (id) => fetch(key+id, {method: 'DELETE'}).then((r) => r.ok)
  const deleteAll = () => fetch(key, {method: 'DELETE'}).then((r) => r.ok)

  const { data: {subscribe}, error, refresh, update, processing } = swr<ClientListItem[]|null>(key, readableSwrOptions)

  /** Add either one or many clients to the list */
  async function addNew(client: ClientListItem['company_number']|ClientListItem['company_number'][]){
    const companyNumbers:string[] = [].concat(client).map(companyNumber=>companyNumber.trim().padStart(8, '0'))
    const newClients = companyNumbers.map(company_number=>({company_number, added_on: new Date().toISOString()}))
    await update(prev=>prev?.concat(newClients).sort(sortClientList)??newClients)
    //call endpoint to add by company number
    await Promise.all(companyNumbers.map(companyNumber=>addClient(companyNumber)))
    await refresh() // after adding, refresh entire list
  }

  async function addMany(rawCompanyNumbers: string[]){
    const companyNumbers = rawCompanyNumbers.map(companyNumber=>companyNumber.trim().padStart(8, '0'))
    const success = await addClients(companyNumbers)
    if(success) {
      const newClients = companyNumbers.map(company_number=>({company_number, added_on: new Date().toISOString()}))
      await update(prev=>prev?.concat(newClients).sort(sortClientList)??newClients)
      await refresh() // after adding, refresh entire list
    }
  }

  async function remove(companyNumber: ClientListItem['company_number']){
    await update(prev=>prev?.filter(c=>c.company_number!==companyNumber)) // sort order shouldn't change
    // call endpoint to remove by company number
    await deleteClient(companyNumber)
    await refresh() // after deleting, refresh entire list
  }
  async function removeAll(){
    await update(()=>[])
    await deleteAll()
    await refresh() // after deleting, refresh entire list
  }

  return {subscribe, addNew,addMany, remove, removeAll, error, refresh, processing}
}

export const clientList = createClientList()


export async function importClientListCsv(csv){
  // console.log("Import CSV", csv.name, csv.type)
  const papa = await import('papaparse')
  const papaOptions: Partial<ParseLocalConfig<unknown, any>> = {
    worker: false, delimiter: ',', skipEmptyLines:true, header: true, transformHeader(header: string): string {
      return camelCase(header.trim())
    }
  }
  const rows:ParseResult<{ companyNumber: string }> = await new Promise((resolve, reject) => papa.parse(csv, {complete: resolve, error: reject,...papaOptions }))
  const companyNumbers = rows.data.map(r=>r.companyNumber).filter(s=>s)
  await clientList.addMany(companyNumbers)
}
