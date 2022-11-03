<script lang="ts">

import {ChevronDown} from "radix-icons-svelte";

const thisMonth = new Date()
thisMonth.setDate(thisMonth.getDate() + 4)
const nextMonth =  new Date()
nextMonth.setMonth(nextMonth.getMonth() + 2)
nextMonth.setDate(nextMonth.getDate() + 15)
const nextYear =  new Date()
nextYear.setMonth(nextYear.getMonth() + 7)
nextYear.setDate(nextYear.getDate() + 2)
const nextYearHalf =  new Date()
nextYearHalf.setMonth(nextYearHalf.getMonth() + 6)
nextYearHalf.setDate(nextYearHalf.getDate() + 20)
const data = [
  {name: "Joinery LTD", date: thisMonth},
  {name: "Wright Partners LLP", date: nextMonth},
  {name: "Smith & Sons LTD", date: nextYearHalf},
  {name: "Green Gardens LTD", date: nextYear}
]
function daysLeft(date: string){
  return Math.round((new Date(date) - Date.now() ) / 86400_000)
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
        <tr><th>Client name</th> <th>Confirmation statement due</th> <th>Time left<ChevronDown/></th></tr>
        {#each data as row}
            <tr class:highlight-red={daysLeft(row.date) < 7} class:highlight-green={daysLeft(row.date) > 365} >
                <td>{row.name}</td> <td>{madeUpTo(row.date).toLocaleDateString()}</td> <td>{daysLeft(row.date)} days</td>
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
