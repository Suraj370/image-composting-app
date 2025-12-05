import { createServerFn } from "@tanstack/react-start";
import sharp from "sharp";

type StripTheme = "plain" | "pastel" | "midnight";
type StickerInput = {
	frameIndex: number;
	emoji: string;
	xPct: number;
	yPct: number;
};

export const generatePikura = createServerFn({
    method: "POST",
})
    .inputValidator((rawData) => rawData as FormData)
    .handler(async ({ data }) => {
        const theme = ((data.get("theme") as StripTheme | null) ??
            "pastel") as StripTheme;

        const stickersJson = (data.get("stickers") as string | null) ?? "[]";
        const stickers = JSON.parse(stickersJson) as StickerInput[];

        const files = data.getAll("frames") as File[];
        if (!files.length) throw new Error("No frames uploaded.");

        const buffers = await Promise.all(
            files.map(async (file) => Buffer.from(await file.arrayBuffer())),
        );

	// Process each image to get their metadata
	const metas = await Promise.all(
		buffers.map(async (buf) => sharp(buf).metadata()),
	);

	// Find the maximum width to ensure all frames fit properly
	const maxWidth = Math.max(...metas.map((m) => m.width ?? 800));

	// Set standard dimensions for a photobooth strip
	// Use aspect ratio similar to typical photo booth strips (portrait orientation)
	const frameWidth = Math.max(maxWidth, 800);
	const frameHeight = Math.floor(frameWidth * 1.33); // 3:4 aspect ratio per frame
	const frameCount = buffers.length;

	// Create a strip with padding
	const padding = 40;
	const framePadding = 20;
	const stripWidth = frameWidth + padding * 2;
	const stripHeight =
		frameHeight * frameCount + framePadding * (frameCount - 1) + padding * 2;

	const bg =
		theme === "midnight"
			? { r: 15, g: 23, b: 42, alpha: 1 }
			: theme === "pastel"
				? { r: 255, g: 240, b: 250, alpha: 1 }
				: { r: 255, g: 255, b: 255, alpha: 1 };

	// 1. Create the base image canvas
	const base = sharp({
		create: {
			width: stripWidth,
			height: stripHeight,
			channels: 4,
			background: bg,
		},
	});

	// 2. Resize and prepare the photo frames for overlay
	const resizedBuffers = await Promise.all(
		buffers.map((buf) =>
			sharp(buf)
				.resize({
					width: frameWidth,
					height: frameHeight,
					fit: "contain",
					background: bg,
				})
				.toBuffer(),
		),
	);

	const frameOverlays = resizedBuffers.map((img, i) => ({
		input: img,
		top: padding + i * (frameHeight + framePadding),
		left: padding,
	}));

	// 3. Generate and prepare sticker overlays
	const STICKER_SIZE_PCT = 15;
	const stickerSize = Math.floor(frameWidth * (STICKER_SIZE_PCT / 100));

	const stickerOverlays = await Promise.all(
		stickers.map(async (sticker) => {
			// Create SVG to render the emoji with a suitable font size/family
			const svg = `
                <svg width="${stickerSize}" height="${stickerSize}" viewBox="0 0 100 100">
                    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Arial, sans-serif">${sticker.emoji}</text>
                </svg>
            `;

			// Convert SVG to a PNG buffer for compositing
			const stickerBuffer = await sharp(Buffer.from(svg))
				.resize(stickerSize, stickerSize)
				.png()
				.toBuffer();

			// Calculate position relative to the entire strip
			const frameTop =
				padding + sticker.frameIndex * (frameHeight + framePadding);

			// Position (center of sticker)
			const centerX = padding + (sticker.xPct / 100) * frameWidth;
			const centerY = (sticker.yPct / 100) * frameHeight;

			// Top/Left is for the top-left corner of the sticker buffer
			const left = Math.floor(centerX - stickerSize / 2);
			const top = Math.floor(frameTop + centerY - stickerSize / 2);

			return {
				input: stickerBuffer,
				top: top,
				left: left,
			};
		}),
	);

	// Combine all overlays (frames first, then stickers on top)
	const finalOverlays = [...frameOverlays, ...stickerOverlays];

	// 4. Composite the strip and stickers, then output as PNG
	const output = await base.composite(finalOverlays).png().toBuffer();

	return {
		imageUrl: `data:image/png;base64,${output.toString("base64")}`,
	};
});
