<div class="container">
	<h1>interactive experimentation</h1>

	<div class="content">
		<div class="text-content">
			<p>So, I'm doing something a bit unhinged. (Shocker.)</p>
			<p>
				I've been obsessed with making games for years. In that time, I've taught myself so much
				about game design, music creation, art, story—essentially everything except for coding the
				actual game.
			</p>
			<p>
				Don't get me wrong. I've tried a few game engines, but I've found them tough to for me,
				largely because they abstract the underlying systems (physics, organization, etc.) away from
				me, and I work best when I understand the whole system.
			</p>
			<p>
				The past few years I've been very into web development, and while I knew in the back of my
				head that making games inside of JavaScript is possible, it never really clicked with me
				that this might be the most fun way to do it—mastering one environment (the web) instead of
				splitting my time here and in game engines.
			</p>
			<p>
				So, I'm going to... just be making experimental shit here. And by shit, I mean it's kinda
				indecipherable to anyone but me who's learning. It just keeps me accountable to post
				publicly, and maybe just maybe after the first few learnings, there will be something real
				to share.
			</p>
		</div>
		<div class="links">
			<a href="arcade/breakout"><p>Project 1: A Crazy Shitty Version of Breakout</p></a>
			<a href="arcade/constellations">
				<p>Project 2: Sometimes the Colors Look Good But Often They Look Like LSD Puke</p>
			</a>
			<a href="arcade/shapes">
				<p>Project 3: Coding Toys for Three-Year-Olds Is Harder Than It Looks</p>
			</a>
			<a href="arcade/jump"><p>Project 4: Moving, Sliding, Jumping</p></a>
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		place-items: center;
		gap: 2.5rem;
		box-sizing: border-box;
		background-color: #bfdbfe;
		padding: 2.5rem;
		width: 100%;
		min-height: 100vh;
		font-size: 1.5rem;
	}

	h1 {
		font-size: 2.25rem;
		text-align: center;
	}

	.content {
		display: flex;
		flex-direction: column-reverse;
		gap: 2.5rem;
	}

	.text-content p {
		margin-bottom: 2.5rem;
	}

	.links {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.links p {
		color: #3b82f6;
	}

	.links a:hover p {
		text-decoration: underline;
	}

	@media (min-width: 768px) {
		.content {
			flex-direction: row;
		}

		.text-content {
			width: 50%;
		}

		.links {
			padding: 0 5rem;
			width: 50%;
		}
	}

	@media (min-width: 1024px) {
		.container {
			padding-right: 5rem;
			padding-left: 5rem;
		}
	}

	@media (min-width: 1280px) {
		.container {
			padding-right: 10rem;
			padding-left: 10rem;
		}
	}
</style>
