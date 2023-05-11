# Front-end Style Guide

## Layout

The designs were created to the following widths:

- Mobile: 375px
- Desktop: 1440px

## Colors

### Primary

- Soft Cyan (Full Slider Bar): hsl(174, 77%, 80%)
- Strong Cyan (Slider Backround): hsl(174, 86%, 45%)
- Light Grayish Red (Discount Background): hsl(14, 92%, 95%)
- Light Red (Discount Text): hsl(15, 100%, 70%)
- Pale Blue (CTA Text): hsl(226, 100%, 87%)

### Neutral

- White (Pricing Component Background): hsl (0, 0%, 100%)
- Very Pale Blue (Main Background): hsl(230, 100%, 99%)
- Light Grayish Blue (Empty Slider Bar): hsl(224, 65%, 95%)
- Light Grayish Blue (Toggle Background): hsl(223, 50%, 87%)
- Grayish Blue (Text): hsl(225, 20%, 60%)
- Dark Desaturated Blue (Text & CTA Background): hsl(227, 35%, 25%)

## Typography

### Body Copy

- Font size (Introductory Paragraph): 15px

### Font

- Family: [Manrope](https://fonts.google.com/specimen/Manrope)
- Weights: 600, 800

/********** Range Input Styles **********/
/*Range Reset*/
input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    width: 100%;
    /* overflow: hidden; */
}

/* Removes default focus */
input[type="range"]:focus {
    outline: none;
}

/***** Chrome, Safari, Opera and Edge Chromium styles *****/
/* slider track */
input[type="range"]::-webkit-slider-runnable-track {
    background-color: var(--clr-neutral-200);
    border-radius: 0.5rem;
    height: 0.5rem;
}

/* slider thumb */
input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    /* Override default look */
    appearance: none;
    margin-top: -12px;
    /* Centers thumb on the track */

    /*custom styles*/
    background: url('images/icon-slider.svg') no-repeat center;
    background-color: var(--clr-soft-cyan);
    height: 2rem;
    width: 2rem;
    border-radius: 50%;
    box-shadow: 0 0 10px red;
}

input[type="range"]:focus::-webkit-slider-thumb {
    background-color: var(--clr-cyan);
}

/******** Firefox styles ********/
/* slider progress */
input[type="range"]::-moz-range-progress {
    background-color: var(--clr-soft-cyan);
    border-radius: 0.5rem;
    height: 0.5rem;
}

/* slider track */
input[type="range"]::-moz-range-track {
    background-color: var(--clr-neutral-200);
    border-radius: 0.5rem;
    height: 0.5rem;
}

/* slider thumb */
input[type="range"]::-moz-range-thumb {
    border: none;
    /*Removes extra border that FF applies*/
    border-radius: 0;
    /*Removes default border-radius that FF applies*/

    /*custom styles*/
    background: url('images/icon-slider.svg') no-repeat center;
    background-color: var(--clr-soft-cyan);
    height: 2rem;
    width: 2rem;
    border-radius: 50%;
}

input[type="range"]:focus::-moz-range-thumb {
    background-color: var(--clr-cyan);
}



/* === range theme and appearance === */
input[type="range"] {
	color: var(--clr-soft-cyan);
	width: 100%;
	--thumb-height: 3rem;
    --thumb-width: 3rem;
	--track-height: 0.5rem;
	--track-color: var(--clr-neutral-200);
	--brightness-hover: 100%;
	--brightness-down: 100%;
	--clip-edges: 0rem;
}

/* === range commons === */
input[type="range"] {
	position: relative;
	background: #fff0;
	overflow: hidden;
}

input[type="range"]:active {
	cursor: grabbing;
}

input[type="range"]:disabled {
	filter: grayscale(1);
	opacity: 0.3;
	cursor: not-allowed;
}

/* === WebKit specific styles === */
input[type="range"],
input[type="range"]::-webkit-slider-runnable-track,
input[type="range"]::-webkit-slider-thumb {
	-webkit-appearance: none;
	transition: all ease 100ms;
	height: var(--thumb-height);
}

input[type="range"]::-webkit-slider-runnable-track,
input[type="range"]::-webkit-slider-thumb {
	position: relative;
}

input[type="range"]::-webkit-slider-thumb {
	--thumb-radius: calc((var(--thumb-height) * 0.5) - 1px);
	--clip-top: calc((var(--thumb-height) - var(--track-height)) * 0.5 - 0.5px);
	--clip-bottom: calc(var(--thumb-height) - var(--clip-top));
	--clip-further: calc(100% + 1px);
	--box-fill: calc(-100vmax - var(--thumb-width, var(--thumb-height))) 0 0
		100vmax currentColor;

	width: var(--thumb-width, var(--thumb-height));
	background: linear-gradient(currentColor 0 0) scroll no-repeat left center /
		50% calc(var(--track-height) + 1px);
	background-color: currentColor;
	box-shadow: var(--box-fill);
	border-radius: var(--thumb-width, var(--thumb-height));

	filter: brightness(100%);
	clip-path: polygon(
		100% -1px,
		var(--clip-edges) -1px,
		0 var(--clip-top),
		-100vmax var(--clip-top),
		-100vmax var(--clip-bottom),
		0 var(--clip-bottom),
		var(--clip-edges) 100%,
		var(--clip-further) var(--clip-further)
	);
}

input[type="range"]:hover::-webkit-slider-thumb {
	filter: brightness(var(--brightness-hover));
	cursor: grab;
}

input[type="range"]:active::-webkit-slider-thumb {
	filter: brightness(var(--brightness-down));
	cursor: grabbing;
}

input[type="range"]::-webkit-slider-runnable-track {
	background: linear-gradient(var(--track-color) 0 0) scroll no-repeat center /
		100% calc(var(--track-height) + 1px);
}

input[type="range"]:disabled::-webkit-slider-thumb {
	cursor: not-allowed;
}

/* === Firefox specific styles === */
input[type="range"],
input[type="range"]::-moz-range-track,
input[type="range"]::-moz-range-thumb {
	appearance: none;
	transition: all ease 100ms;
	height: var(--thumb-height);
}

input[type="range"]::-moz-range-track,
input[type="range"]::-moz-range-thumb,
input[type="range"]::-moz-range-progress {
	background: #fff0;
}

input[type="range"]::-moz-range-thumb {
	background: currentColor;
	border: 0;
	width: var(--thumb-width, var(--thumb-height));
	border-radius: var(--thumb-width, var(--thumb-height));
	cursor: grab;
}

input[type="range"]:active::-moz-range-thumb {
	cursor: grabbing;
}

input[type="range"]::-moz-range-track {
	width: 100%;
	background: var(--track-color);
}

input[type="range"]::-moz-range-progress {
	appearance: none;
	background: currentColor;
	transition-delay: 30ms;
}

input[type="range"]::-moz-range-track,
input[type="range"]::-moz-range-progress {
	height: calc(var(--track-height) + 1px);
	border-radius: var(--track-height);
}

input[type="range"]::-moz-range-thumb,
input[type="range"]::-moz-range-progress {
	filter: brightness(100%);
}

input[type="range"]:hover::-moz-range-thumb,
input[type="range"]:hover::-moz-range-progress {
	filter: brightness(var(--brightness-hover));
}

input[type="range"]:active::-moz-range-thumb,
input[type="range"]:active::-moz-range-progress {
	filter: brightness(var(--brightness-down));
}

input[type="range"]:disabled::-moz-range-thumb {
	cursor: not-allowed;
}