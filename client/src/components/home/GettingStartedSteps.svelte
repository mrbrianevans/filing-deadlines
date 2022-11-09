<script lang="ts">


  import {user} from "../../lib/stores/user.js";
  import {clientList} from "../../lib/stores/clientList.js";
  import {ArrowRight} from "radix-icons-svelte";

  $: signupComplete = Boolean($user)
  $: clientListComplete = $clientList?.length > 0
  $: viewDashboardComplete = false
  let root
  let options = {
    rootMargin: '0px',
    threshold: 1.0
  }
  let observer = new IntersectionObserver(()=>console.log('Scrolled into view'), options);
  $: if(root) observer.observe(root)

</script>

<div>
<!--  <h2 style="margin: 5px;" bind:this={root}>Get started with 3 simple steps</h2>-->
  <div class="steps">
    <span class="step" class:complete={signupComplete}><span class="number">1</span><span>Sign up </span></span>
    <span class="arrow"> <ArrowRight/> </span>
    <span class="step" class:complete={clientListComplete}><span class="number">2</span><span>Upload list of clients</span></span>
    <span class="arrow"> <ArrowRight/> </span>
    <span class="step" class:complete={viewDashboardComplete}><span class="number">3</span><span>View dashboard</span></span>
  </div>

</div>


<style lang="scss">
.steps{
  display: inline-flex;
  flex-direction: row;
  gap: 1rem;
  justify-items: start;
  align-items: center;
  .step{
    background: VAR(--contrast);
    border-radius: 50%;
    padding: 1rem;
    height: 10rem;
    width: 10rem;
    border: 3px solid var(--svelteui-colors-blue600);
    display: inline-grid;
    grid-template-rows: repeat(2, 5rem);
    //place-content: center;

    text-align: center;
    .number{
      font-size: 3rem;
      opacity: 0.6;
      //display: none;
    }
  }

  .step.complete{
    background: VAR(--svelteui-colors-green100);
    border: 3px solid var(--svelteui-colors-green600);

  }
}
  @media (max-width: 700px) {
    .steps{
      flex-direction: column;
    }
    .arrow{
      transform: rotate(90deg);
    }
  }
</style>
