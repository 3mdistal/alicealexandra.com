<div class="docked-utility-bar">
	<div class="utility-tab">
		<div class="tab-content">
			<div class="tab-icon">
				<svg
					width="16"
					height="14"
					viewBox="0 0 16 14"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M7.38458 1.15385L6.8615 0.630767C6.70766 0.476919 6.49227 0.476919 6.33843 0.630767L3.0769 3.86156L1.75382 2.56925C1.59998 2.4154 1.38459 2.4154 1.23075 2.56925L0.70767 3.09233C0.553824 3.24617 0.553824 3.46156 0.70767 3.61541L2.52305 5.43081C2.6769 5.58466 2.86151 5.6462 3.04613 5.6462C3.23074 5.6462 3.41536 5.58466 3.5692 5.43081L7.38458 1.67693C7.50766 1.55385 7.50766 1.3077 7.38458 1.15385ZM14.8923 4.66051H8.46159C8.18467 4.66051 7.96928 4.44512 7.96928 4.16819V3.18357C7.96928 2.90664 8.18467 2.69126 8.46159 2.69126H14.8923C15.1693 2.69126 15.3847 2.90664 15.3847 3.18357V4.16819C15.3847 4.44512 15.1693 4.66051 14.8923 4.66051ZM14.8921 9.06112H6.98447C6.70754 9.06112 6.49216 8.84573 6.49216 8.56881V7.58418C6.49216 7.30726 6.70754 7.09187 6.98447 7.09187H14.8921C15.1691 7.09187 15.3844 7.30726 15.3844 7.58418V8.56881C15.3844 8.84573 15.1691 9.06112 14.8921 9.06112ZM3.99978 9.06112H3.01516C2.73824 9.06112 2.52286 8.84573 2.52286 8.56881V7.58418C2.52286 7.30726 2.73824 7.09187 3.01516 7.09187H3.99978C4.2767 7.09187 4.49208 7.30726 4.49208 7.58418V8.56881C4.52285 8.84573 4.2767 9.06112 3.99978 9.06112ZM3.99978 13.4615H3.01516C2.73824 13.4615 2.52286 13.2461 2.52286 12.9692V11.9846C2.52286 11.7076 2.73824 11.4922 3.01516 11.4922H3.99978C4.2767 11.4922 4.49208 11.7076 4.49208 11.9846V12.9692C4.52285 13.2461 4.2767 13.4615 3.99978 13.4615ZM14.8921 13.4615H6.98447C6.70754 13.4615 6.49216 13.2461 6.49216 12.9692V11.9846C6.49216 11.7076 6.70754 11.4922 6.98447 11.4922H14.8921C15.1691 11.4922 15.3844 11.7076 15.3844 11.9846V12.9692C15.3844 13.2461 15.1691 13.4615 14.8921 13.4615Z"
						fill="#747474"
					/>
				</svg>
			</div>

			<div class="tab-label-content">
				<div class="tab-label">
					<span>To Do List</span>
				</div>
			</div>

			<div class="popout-indicator"></div>
		</div>
	</div>
</div>

<style>
	.docked-utility-bar {
		display: flex;
		position: relative;
		bottom: 0px;
		align-items: flex-start;
		gap: 1px;
		box-shadow:
			0px 1px 1.2px 0px rgba(0, 0, 0, 0.04),
			0px -2.8px 2.9px 0px rgba(0, 0, 0, 0.09),
			0px 0px 2.9px 0px rgba(0, 0, 0, 0.09);
		background: var(--slds-g-color-surface-container-1);
		width: 1440px;
	}

	.utility-tab {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: flex-end;
		align-items: flex-start;
		height: 40px;
	}

	.tab-content {
		display: flex;
		position: relative;
		flex: 1 0 0;
		align-items: center;
		gap: var(--slds-g-spacing-2);
		padding-left: var(--slds-g-spacing-3);
	}

	.tab-icon {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		align-self: stretch;
		padding: 12px 0px;
		width: 16px;
	}

	.tab-label-content {
		display: flex;
		position: relative;
		align-items: center;
		align-self: stretch;
	}

	.tab-label {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		align-self: stretch;
		padding: 10px 0px;
	}

	.tab-label span {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		position: relative;
		overflow: hidden;
		color: var(--slds-g-color-on-surface-1);
		color: rgba(92, 92, 92, 1);
		font-style: normal;
		font-weight: 590;
		font-weight: 400;
		font-size: 14px;
		line-height: 19px;
		font-family: 'SF Pro';
		font-family:
			SF Pro,
			-apple-system,
			Roboto,
			Helvetica,
			sans-serif;
		font-feature-settings:
			'liga' off,
			'clig' off;
		text-overflow: ellipsis;
	}

	.popout-indicator {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: flex-start;
		align-self: stretch;
		padding-top: var(--slds-g-spacing-1);
		width: 12px;
	}
</style>
