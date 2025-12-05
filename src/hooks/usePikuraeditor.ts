import * as React from "react";
import type { Sticker, StripTheme } from "@/types/pikura";
import { STICKER_GALLERY } from "@/types/pikura";

export function usePikuraEditor() {
	const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);
	const [activeFrame, setActiveFrame] = React.useState(0);
	const [stickers, setStickers] = React.useState<Sticker[]>([]);
	const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(
		STICKER_GALLERY[0],
	);
	const [finalStripUrl, setFinalStripUrl] = React.useState<string | null>(null);
	const [theme, setTheme] = React.useState<StripTheme>("pastel");

	// Cleanup preview URLs on unmount
	React.useEffect(() => {
		return () => {
			previewUrls.forEach((url) => {
				URL.revokeObjectURL(url);
			});
		};
	}, [previewUrls]);

	const currentImageUrl = previewUrls[activeFrame] ?? null;
	const stickersForActiveFrame = stickers.filter(
		(s) => s.frameIndex === activeFrame,
	);

	const handleAddStickerAt = React.useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!currentImageUrl || !selectedEmoji) return;

			const rect = e.currentTarget.getBoundingClientRect();
			const xPct = ((e.clientX - rect.left) / rect.width) * 100;
			const yPct = ((e.clientY - rect.top) / rect.height) * 100;

			setStickers((prev) => [
				...prev,
				{
					id: crypto.randomUUID(),
					frameIndex: activeFrame,
					emoji: selectedEmoji,
					xPct,
					yPct,
				},
			]);
		},
		[currentImageUrl, selectedEmoji, activeFrame],
	);

	const removeSticker = React.useCallback((id: string) => {
		setStickers((prev) => prev.filter((s) => s.id !== id));
	}, []);

	const handleDownload = React.useCallback(() => {
		if (!finalStripUrl) return;

		const link = document.createElement("a");
		link.href = finalStripUrl;
		link.download = `pikura-strip-${Date.now()}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}, [finalStripUrl]);

	return {
		previewUrls,
		setPreviewUrls,
		activeFrame,
		setActiveFrame,
		stickers,
		setStickers,
		selectedEmoji,
		setSelectedEmoji,
		finalStripUrl,
		setFinalStripUrl,
		theme,
		setTheme,
		currentImageUrl,
		stickersForActiveFrame,
		handleAddStickerAt,
		removeSticker,
		handleDownload,
	};
}
