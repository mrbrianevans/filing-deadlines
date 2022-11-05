<script>
    import {Route} from "svelte-navigator";
    import PricingPage from "./PricingPage.svelte";
    import About from "./About.svelte";
    import HowItWorks from "./HowItWorks.svelte";
    import Contact from "./Contact.svelte";
    import PrivacyPolicy from "./PrivacyPolicy.svelte";
    import HowSubscriptionsWork from "./HowSubscriptionsWork.svelte";
</script>


<div>
    <Route path="/pricing">
        <PricingPage />
    </Route>
    <Route path="/about">
        <About />
    </Route>
    <Route path="/contact">
        <Contact />
    </Route>
    <Route path="/how-it-works">
        <HowItWorks />
    </Route>
    <Route path="/privacy-policy">
        <PrivacyPolicy />
    </Route>
    <Route path="/how-subscriptions-work">
        <HowSubscriptionsWork />
    </Route>
</div>
