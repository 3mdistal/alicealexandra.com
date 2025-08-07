<div class="opportunities-card">
	<div class="card-header">
		<div class="header-title">
			<span>Opportunities</span>
		</div>
		<div class="expand-button">
			<div class="expand-button-container">
				<div class="expand-icon">
					<svg
						width="12"
						height="13"
						viewBox="0 0 12 13"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M11.2614 0.96154H7.68452C7.45375 0.96154 7.38452 1.16923 7.56914 1.35384L8.6999 2.4846L6.62299 4.56151C6.50761 4.67689 6.50761 4.86151 6.62299 4.99997L7.47683 5.85381C7.59221 5.96919 7.77683 5.96919 7.91529 5.85381L10.0153 3.75383L11.146 4.88459C11.3307 5.0692 11.5383 4.99997 11.5383 4.7692V1.21538C11.5383 1.07692 11.3999 0.96154 11.2614 0.96154ZM0.807638 12.0385H4.36146C4.59223 12.0385 4.66146 11.7846 4.47685 11.6L3.34608 10.4462L5.42299 8.34619C5.53838 8.2308 5.53838 8.02311 5.42299 7.90773L4.56915 7.05389C4.45377 6.93851 4.26915 6.93851 4.13069 7.05389L2.05378 9.1308L0.899946 8.00004C0.692255 7.81542 0.461487 7.88465 0.461487 8.11542V11.6692C0.461487 11.8308 0.646101 12.0385 0.807638 12.0385ZM11.5385 11.7615V8.18464C11.5385 7.95387 11.3308 7.88464 11.1462 8.06925L10.0154 9.20001L7.9385 7.12311C7.82311 7.00772 7.6385 7.00772 7.50004 7.12311L6.6462 7.97695C6.53081 8.09233 6.53081 8.27694 6.6462 8.4154L8.74618 10.5154L7.61542 11.6461C7.43081 11.8308 7.50004 12.0385 7.73081 12.0385H11.2846C11.4231 12.0385 11.5385 11.9 11.5385 11.7615ZM0.461487 1.30769V4.86151C0.461487 5.09228 0.715331 5.16151 0.899946 4.97689L2.05378 3.84613L4.15377 5.92304C4.26915 6.03842 4.47685 6.03842 4.59223 5.92304L5.44607 5.0692C5.56145 4.95381 5.56145 4.7692 5.44607 4.63074L3.36916 2.55383L4.49992 1.4C4.68454 1.19231 4.61531 0.96154 4.38454 0.96154H0.830715C0.669178 0.96154 0.461487 1.14615 0.461487 1.30769Z"
							fill="#0250D9"
						/>
					</svg>
				</div>
			</div>
		</div>
	</div>

	<div class="card-body">
		<div class="opportunities-content">
			<div class="chart-container">
				<div class="axis-labels">
					<div class="axis-label">
						<span>Qualifying</span>
					</div>
					<div class="axis-label">
						<span>Proposal</span>
					</div>
					<div class="axis-label">
						<span>Negotiation</span>
					</div>
					<div class="axis-label">
						<span>Closed Won</span>
					</div>
				</div>

				<div class="bar-chart">
					<div class="bar-item">
						<div class="bar full-bar">
							<div class="bar-value">
								<span>$50k</span>
							</div>
						</div>
					</div>
					<div class="bar-item">
						<div class="bar medium-bar">
							<div class="bar-value">
								<span>$35k</span>
							</div>
						</div>
					</div>
					<div class="bar-item">
						<div class="bar small-bar">
							<div class="bar-value">
								<span>$25k</span>
							</div>
						</div>
					</div>
					<div class="bar-item">
						<div class="bar tiny-bar">
							<div class="bar-value">
								<span>$15k</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="card-footer">
		<div class="footer-link">
			<div class="link-text">
				<span>View All</span>
			</div>
		</div>
	</div>
</div>

<style>
	.opportunities-card {
		display: flex;
		position: relative;
		flex-direction: column;
		align-items: center;
		align-self: stretch;
		border-radius: var(--slds-g-radius-border-4);
	}

	.card-header {
		display: flex;
		position: relative;
		align-items: center;
		align-self: stretch;
		gap: 8px;
		background: var(--slds-g-color-surface-container-1);
		padding: var(--slds-g-spacing-4);
	}

	.header-title {
		display: flex;
		position: relative;
		flex: 1 0 0;
		flex-direction: column;
		justify-content: center;
		height: 27px;
		color: var(--slds-g-color-on-surface-3);
		font-style: normal;
		font-weight: 400;
		font-size: 20px;
		line-height: 28px;
		font-family: 'SF Pro';
		font-feature-settings:
			'liga' off,
			'clig' off;
	}

	.header-title span {
		color: rgba(3, 35, 77, 1);
		font-weight: 400;
		font-size: 20px;
		font-family:
			SF Pro,
			-apple-system,
			Roboto,
			Helvetica,
			sans-serif;
	}

	.expand-button {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		border-radius: var(--slds-g-radius-border-circle);
	}

	.expand-button-container {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		border-radius: var(--slds-g-radius-border-circle);
		width: 20px;
		height: 20px;
	}

	.expand-icon {
		position: relative;
		flex-shrink: 0;
		width: 12px;
		height: 12px;
	}

	.card-body {
		display: flex;
		position: relative;
		flex-direction: column;
		align-items: flex-start;
		align-self: stretch;
		background: var(--slds-g-color-surface-container-1);
		padding: var(--slds-g-spacing-0) var(--slds-g-spacing-4) var(--slds-g-spacing-4)
			var(--slds-g-spacing-4);
	}

	.opportunities-content {
		display: flex;
		position: relative;
		align-items: flex-start;
		align-self: stretch;
		gap: var(--slds-g-spacing-3);
	}

	.axis-labels {
		display: flex;
		position: relative;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		height: 166px;
	}

	.axis-label {
		display: flex;
		position: relative;
		flex: 1 0 0;
		flex-direction: column;
		justify-content: center;
		align-self: stretch;
		color: var(--slds-g-color-on-surface-2);
		font-style: normal;
		font-weight: 590;
		font-size: 12px;
		line-height: 17px;
		font-family: 'SF Pro';
		font-feature-settings:
			'liga' off,
			'clig' off;
	}

	.axis-label span {
		color: rgba(46, 46, 46, 1);
		font-weight: 400;
		font-size: 12px;
		font-family:
			SF Pro,
			-apple-system,
			Roboto,
			Helvetica,
			sans-serif;
	}

	.bar-chart {
		display: flex;
		position: relative;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		width: 301px;
		height: 166px;
	}

	.bar-item {
		position: relative;
		flex: 1 0 0;
		align-self: stretch;
	}

	.bar {
		display: flex;
		position: absolute;
		top: 0px;
		left: 0px;
		justify-content: flex-end;
		align-items: center;
		border-radius: 4px;
		background: #fcb95b;
		padding-right: 16px;
		height: 39px;
	}

	.full-bar {
		width: 301px;
	}

	.medium-bar {
		background: rgba(252, 185, 91, 0.6);
		width: 208px;
	}

	.small-bar {
		background: rgba(252, 185, 91, 0.4);
		width: 149px;
	}

	.tiny-bar {
		background: rgba(252, 185, 91, 0.2);
		width: 89px;
	}

	.bar-value {
		position: relative;
		color: var(--slds-g-color-on-surface-2);
		font-style: normal;
		font-weight: 700;
		font-size: 13px;
		line-height: 18px;
		font-family: 'SF Pro';
		font-feature-settings:
			'liga' off,
			'clig' off;
		text-align: right;
	}

	.bar-value span {
		color: rgba(46, 46, 46, 1);
		font-weight: 700;
		font-size: 13px;
		font-family:
			SF Pro,
			-apple-system,
			Roboto,
			Helvetica,
			sans-serif;
	}

	.card-footer {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		align-self: stretch;
		gap: var(--slds-g-spacing-2);
		border-top: 1px solid var(--slds-g-color-border-1);
		border-radius: 0px 0px var(--slds-g-radius-border-4) var(--slds-g-radius-border-4);
		background: var(--slds-g-color-surface-container-1);
		padding: var(--slds-g-spacing-3) var(--slds-g-spacing-4) 12px var(--slds-g-spacing-4);
		height: 42px;
	}

	.footer-link {
		display: flex;
		position: relative;
		align-items: center;
		gap: var(--slds-g-spacing-1);
		height: 18px;
	}

	.link-text {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		height: 18px;
	}

	.link-text span {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		position: relative;
		overflow: hidden;
		color: var(--slds-g-color-accent-2);
		color: rgba(2, 80, 217, 1);
		font-style: normal;
		font-weight: 400;
		font-size: 13px;
		line-height: 18px;
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
</style>
