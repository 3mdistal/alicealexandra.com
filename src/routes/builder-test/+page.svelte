<script lang="ts">
	import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
	import GlobalNavigation from '$lib/components/dashboard/GlobalNavigation.svelte';
	import RecentActivityCard from '$lib/components/dashboard/RecentActivityCard.svelte';
	import LeadsCard from '$lib/components/dashboard/LeadsCard.svelte';
	import ContactsCard from '$lib/components/dashboard/ContactsCard.svelte';
	import AccountsCard from '$lib/components/dashboard/AccountsCard.svelte';
	import OpportunitiesCard from '$lib/components/dashboard/OpportunitiesCard.svelte';
	import DockedUtilityBar from '$lib/components/dashboard/DockedUtilityBar.svelte';
</script>

<svelte:head>
	<title>Salesforce Dashboard</title>
</svelte:head>

<div class="dashboard">
	<DashboardHeader />
	<GlobalNavigation />

	<div class="page-content">
		<div class="left-column">
			<RecentActivityCard />
		</div>

		<div class="center-column">
			<LeadsCard />
			<ContactsCard />
		</div>

		<div class="right-column">
			<AccountsCard />
			<OpportunitiesCard />
		</div>
	</div>

	<DockedUtilityBar />
</div>

<style>
	:global(:root) {
		--surface-container-on-surface-1-neutral-40: --slds-g-color-on-surface-1;
		--font-family-base: 'SF Pro';
		--font-scale-base: 13px;
		--surface-container-on-surface-3-blue-15: --slds-g-color-on-surface-3;
		--font-scale-3: 20px;
		--font-scale-1: 14px;
		--surface-container-accent-2-electric-blue-40: --slds-g-color-accent-2;
		--Icon-White: #fff;
		--font-scale-neg-1: 12px;
		--spacing-2: 8px;
		--padding-spacing-3: 12px;
		--surface-container-on-surface-2-neutral-20: --slds-g-color-on-surface-2;
		--Icon-Default: #747474;
	}

	.dashboard {
		display: flex;
		position: absolute;
		top: 0px;
		left: 0px;
		flex-direction: column;
		align-items: flex-start;
		border: 1px solid var(--slds-g-color-border-1);
		border-radius: var(--slds-g-radius-border-2);
		background: var(--slds-g-color-surface-2);
		width: 1440px;
		height: 900px;
	}

	.page-content {
		display: flex;
		position: relative;
		bottom: 40px;
		justify-content: center;
		align-items: flex-start;
		gap: var(--slds-g-spacing-3);
		padding: var(--slds-g-spacing-4);
		width: 1440px;
		height: 756px;
	}

	.left-column,
	.center-column,
	.right-column {
		display: flex;
		position: relative;
		flex: 1 0 0;
		flex-direction: column;
		align-items: center;
		align-self: stretch;
		gap: var(--slds-g-spacing-3);
	}
</style>
