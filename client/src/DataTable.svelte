<script lang="ts">
  import '@vaadin/grid/theme/material/vaadin-grid.js';
  import '@vaadin/grid/theme/material/vaadin-grid-filter-column.js';
  import '@vaadin/grid/theme/material/vaadin-grid-selection-column.js';
  import '@vaadin/grid/theme/material/vaadin-grid-sort-column.js';
  import '@vaadin/grid/theme/material/vaadin-grid-tree-column.js';
  import {onMount} from 'svelte'
  import {Badge, Container} from "@svelteuidev/core";
  import {constants} from "./lib/constants.js";
  import {Rocket} from "radix-icons-svelte";

  export let data

   let items: any[] = []
   let grid, statusCol, filedCol, timeLeftCol, accTypeCol, compTypeCol
   let mounted = false
   $: if (mounted) {
     grid.items = items
     grid.theme='row-stripes'
     statusCol.renderer = (root: Element, grid, {item}) => {
       const badgeStyle = item.company_status === 'active' ? 'success' : 'error'
       root.innerHTML = `<span theme="badge ${badgeStyle}">${constants.company_status[item.company_status]}</span>`;
     }
     filedCol.renderer = (root: Element, grid, {item}) => {
       const lastDate = item.accounts.last_accounts.made_up_to
       const dueDate = item.accounts.next_due
       const badgeStyle = new Date(dueDate) - new Date(lastDate).getTime() < 86400*1000*9*30 ? 'success' : ''
       root.innerHTML = `<span>${item.accounts.last_accounts.made_up_to}</span>`;
     }
     timeLeftCol.renderer = (root: Element, grid, {item}) => {
       const dueDate = item.accounts.next_due
       const daysLeft = Math.round((new Date(dueDate) - new Date() )/1000/86400)
       const badgeStyle = daysLeft > 30 ? 'success' : 'error'
       root.innerHTML = `<span theme="badge ${badgeStyle}">${daysLeft} days</span>`;
     }
     accTypeCol.renderer = (root: Element, grid, {item}) => {
       const accountsType = constants.account_type[item.accounts.last_accounts.type]
       const badgeStyle = item.accounts.last_accounts.type === 'dormant' ? 'badge' : ''
       root.innerHTML = `<span theme="${badgeStyle}">${accountsType}</span>`
     }
     compTypeCol.renderer = (root: Element, grid, {item}) => {
       const companyType = constants.company_type[item.type]
       root.innerHTML = `<span theme="">${companyType}</span>`
     }
   }
   onMount(() => mounted = true)

   const getGridData = (d) => {
     return d.filter(c=>c.accounts?.next_due)
       .sort((a,b)=>a.accounts.next_due.localeCompare(b.accounts.next_due))
   }
   $: items = getGridData(data)
</script>

<main>
<Container size="xl">
    <vaadin-grid bind:this={grid} column-reordering-allowed multi-sort>

        <vaadin-grid-column auto-width path={'company_name'} header="Company"></vaadin-grid-column>
        <vaadin-grid-column auto-width path={'company_number'} header="Reg number"></vaadin-grid-column>
        <vaadin-grid-column auto-width header="Company status" bind:this={statusCol}></vaadin-grid-column>
        <vaadin-grid-column auto-width path={'accounts.next_due'} header="Filing deadline"></vaadin-grid-column>
        <vaadin-grid-column auto-width header="Last filed" bind:this={filedCol}></vaadin-grid-column>
        <vaadin-grid-column auto-width bind:this={accTypeCol} header="Accounts type"></vaadin-grid-column>
        <vaadin-grid-column auto-width bind:this={compTypeCol} header="Company type"></vaadin-grid-column>
        <vaadin-grid-column auto-width header="Time left" bind:this={timeLeftCol}></vaadin-grid-column>

    </vaadin-grid>

</Container>
</main>


<style>
    vaadin-grid{
        height: 100vh;
    }
</style>
