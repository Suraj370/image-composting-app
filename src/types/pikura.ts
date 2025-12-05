export type StripTheme = "plain" | "pastel" | "midnight";

export type Sticker = {
	id: string;
	frameIndex: number;
	emoji: string;
	xPct: number;
	yPct: number;
};

export type EditorFormValues = {
	frames: File[];
	theme: StripTheme;
};

export const MAX_FRAMES = 4;

export const STICKER_GALLERY = ["✨", "💖", "🌸", "😺", "⭐", "🎀", "🩷", "💫"];

export const STRIP_THEME_STYLES: Record<
	StripTheme,
	{
		outer: string;
		inner: string;
		frame: string;
		preview: string;
	}
> = {
	plain: {
		outer: "bg-white ring-slate-200",
		inner: "bg-slate-50",
		frame: "bg-white",
		preview: "bg-slate-100",
	},
	pastel: {
		// Note: 'bg-linear-to-br' is assumed to be a custom utility or shorthand for gradient background.
		outer: "bg-gradient-to-br from-pink-100 via-rose-50 to-sky-100 ring-pink-200",
		inner: "bg-pink-50/70",
		frame: "bg-white/80",
		preview: "bg-gradient-to-br from-pink-50 via-slate-100 to-sky-50",
	},
	midnight: {
		outer: "bg-gray-900 ring-gray-700 text-white",
		inner: "bg-gray-800",
		frame: "bg-gray-950/70",
		preview: "bg-gray-700/50",
	},
};