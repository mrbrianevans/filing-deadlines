<script lang="ts">

import {ChevronDown} from "radix-icons-svelte";

const thisMonth = new Date()
thisMonth.setMonth(thisMonth.getMonth() + 1)
thisMonth.setDate(0)
const nextMonth =  new Date()
nextMonth.setMonth(nextMonth.getMonth() + 2)
nextMonth.setDate(0)
const nextYear =  new Date()
nextYear.setMonth(nextYear.getMonth() + 14)
nextYear.setDate(0)
const nextYearHalf =  new Date()
nextYearHalf.setMonth(nextYearHalf.getMonth() + 6)
nextYearHalf.setDate(0)
const data = [
  {name: "Bob's Bakery LTD", date: thisMonth},
  {name: "Rental Properties LTD", date: thisMonth},
  {name: "Wright Partners LLP", date: nextMonth},
  {name: "Smith & Sons LTD", date: nextYearHalf},
  {name: "Green Gardens LTD", date: nextYear}
]
function daysLeft(date: string){
  return (new Date(date) - Date.now() ) / 86400_000
}
function madeUpTo(deadline: Date){
  const madeDate = new Date(deadline.toISOString())
  madeDate.setMonth(madeDate.getMonth() - 9)
  madeDate.setDate(0)
  return madeDate
}
</script>

<div>
    <table class="no-breaks">
        <tr><th>Client name</th> <th>Next accounts made up to</th> <th>Next accounts due <ChevronDown/></th></tr>
        {#each data as row}
            <tr class:highlight-red={daysLeft(row.date) < 31} class:highlight-green={daysLeft(row.date) > 365} >
                <td>{row.name}</td> <td>{madeUpTo(row.date).toLocaleDateString()}</td> <td>{row.date.toLocaleDateString()}</td>
            </tr>
        {/each}
    </table>
</div>


<style>
    .highlight-red{
        background: rgba(235, 77, 75, 0.1);
    }
    .highlight-green{
        background: rgba(186, 220, 88, 0.1);
    }
    table.no-breaks *{
        white-space: nowrap;
        overflow: clip;
        text-overflow: ellipsis;
    }
</style>
