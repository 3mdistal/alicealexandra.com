import { prefersReducedMotion } from '$lib/accessibility/prefers-reduced-motion';
import { interludeToggleIcon } from '$lib/blog/render-markdown';

type ReaderChoice = 'play' | 'pause';

/** The reader's last press of each video's button. It outlasts re-runs of the setup below. */
const readerChoices = new WeakMap<HTMLVideoElement, ReaderChoice>();

/**
 * Interlude videos are silent loops that play while they're on screen. Each one's button lets the
 * reader pause it (WCAG 2.2.2), and none starts by itself when the reader prefers reduced motion.
 * A press of the button wins over both: a paused video stays paused when scrolled back to.
 *
 * Works on the frames `renderBlogMarkdown` makes with `interludeVideoControls`, and returns a
 * cleanup that stops the videos and drops the listeners, leaving the markup in place.
 */
export function enhanceInterludeVideos(root: HTMLElement): () => void {
	const frames = Array.from(root.querySelectorAll<HTMLElement>('.session-interlude')).flatMap(
		(frame) => {
			const video = frame.querySelector<HTMLVideoElement>('.session-interlude-video');
			const button = frame.querySelector<HTMLButtonElement>('.session-interlude-toggle');
			return video && button ? [{ video, button }] : [];
		}
	);

	if (!frames.length) {
		return () => {};
	}

	const listeners = new AbortController();
	const { signal } = listeners;
	const onScreen = new Set<HTMLVideoElement>();
	let reducedMotion = true;

	const play = (video: HTMLVideoElement) => void video.play().catch(() => {});

	// Without a press, a video plays on screen unless the reader prefers reduced motion.
	const follow = (video: HTMLVideoElement) => {
		const choice = readerChoices.get(video);
		const wanted = choice ? choice === 'play' : !reducedMotion;

		if (onScreen.has(video) && wanted) {
			play(video);
		} else {
			video.pause();
		}
	};

	const showState = (video: HTMLVideoElement, button: HTMLButtonElement) => {
		const playing = !video.paused;
		button.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
		button.innerHTML = interludeToggleIcon(playing);
	};

	frames.forEach(({ video, button }) => {
		video.controls = false;
		video.muted = true;
		video.loop = true;
		video.playsInline = true;

		const update = () => showState(video, button);
		video.addEventListener('play', update, { signal });
		video.addEventListener('pause', update, { signal });
		button.addEventListener(
			'click',
			() => {
				const choice: ReaderChoice = video.paused ? 'play' : 'pause';
				readerChoices.set(video, choice);

				if (choice === 'play') {
					play(video);
				} else {
					video.pause();
				}

				// `paused` flips at once but the play/pause events come a task later, so relabel
				// now for a screen reader announcing the pressed button.
				update();
			},
			{ signal }
		);

		update();
		button.hidden = false;
	});

	if (typeof IntersectionObserver === 'undefined') {
		return () => listeners.abort();
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const video = entry.target as HTMLVideoElement;

				if (entry.isIntersecting) {
					onScreen.add(video);
				} else {
					onScreen.delete(video);
				}

				follow(video);
			});
		},
		{ threshold: 0.5 }
	);

	const stopFollowingMotion = prefersReducedMotion.subscribe((reduce) => {
		reducedMotion = reduce;
		frames.forEach(({ video }) => follow(video));
	});

	frames.forEach(({ video }) => observer.observe(video));

	return () => {
		observer.disconnect();
		stopFollowingMotion();
		listeners.abort();
		frames.forEach(({ video }) => video.pause());
	};
}
